import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import { createServer } from "http";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { PubSub } from "graphql-subscriptions";
import bodyParser from "body-parser";
import cors from "cors";

const PORT = 4000;
const pubsub = new PubSub();

// A number that we'll increment over time to simulate subscription events
let currentNumber = 0;

const typeDefs = `#graphql
  type E {
    id: ID
    name: String
    bs: [B]
  }

  type B {
    id: ID
    name: String
    ls: [L]
  }

  type L {
    id: ID
    name: String
    gs: [G]
  }

  type G {
    id: ID
    name: String
    ms: [M]
  }

  type M {
    id: ID
    name: String
    is: [Float]
    vs: [Float]
  }

  type Cake {
    id: ID
    name: String
  }

  type Cookie {
    id: ID
    name: String
  }

  type Query {
    e: E
    cake: Cake
    cookie: Cookie
  }

  type Subscription {
    numberIncremented: Int
  }
`;

const BS = 2;
const LS = 2;
const GS = 3;
const MS = 3;
const IS = 4_000;
const VS = 4_000;

const bs = [];
for (let b = 1; b <= BS; b++) {
  const ls = [];
  for (let l = 1; l <= LS; l++) {
    const gs = [];
    for (let g = 1; g <= GS; g++) {
      const ms = [];
      for (let m = 1; m <= MS; m++) {
        const is = [];
        for (let i = 1; i <= IS; i++) {
          is.push(Math.random() * 2_000 - 1_000);
        }
        const vs = [];
        for (let v = 1; v <= VS; v++) {
          vs.push(Math.random() * 2_000 - 1_000);
        }
        ms.push({
          id: `m_${b}_${l}_${g}_${m}`,
          name: `M_${b}_${l}_${g}_${m}`,
          is,
          vs,
        });
      }
      gs.push({ id: `g_${b}_${l}_${g}`, name: `G_${b}_${l}_${g}`, ms });
    }
    ls.push({ id: `l_${b}_${l}`, name: `L_${b}_${l}`, gs });
  }
  bs.push({ id: `b_${b}`, name: `B_${b}`, ls });
}

const e = {
  id: "e1",
  name: "E1",
  bs,
};

const cakes = [
  "Chocolate Fudge Cake",
  "Classic Vanilla Sponge",
  "Red Velvet Cake",
  "Lemon Drizzle Cake",
  "Carrot Walnut Cake",
  "Black Forest Cake",
  "Strawberry Shortcake",
  "Tiramisu Cake",
  "Matcha Green Tea Cake",
  "Blueberry Cheesecake",
];

const makeGetCake = () => {
  let i = -1;

  return () => {
    if (i + 1 < cakes.length) {
      i += 1;
    } else {
      i = 0;
    }

    return {
      id: "the-true-cake",
      name: cakes[i],
    };
  };
};

const cookies = [
  "Classic Chocolate Chip Cookie",
  "Double Chocolate Chunk Cookie",
  "Oatmeal Raisin Cookie",
  "Peanut Butter Crinkle Cookie",
  "Snickerdoodle Cookie",
  "White Chocolate Macadamia Cookie",
  "Matcha Almond Cookie",
  "Ginger Molasses Cookie",
  "Lemon Sugar Cookie",
  "Salted Caramel Cookie",
];

const makeGetCookie = () => {
  let i = -1;

  return () => {
    if (i + 1 < cookies.length) {
      i += 1;
    } else {
      i = 0;
    }

    return {
      id: "the-true-cookie",
      name: cookies[i],
    };
  };
};

const resolvers = {
  Query: {
    e: () => e,
    cake: makeGetCake(),
    cookie: makeGetCookie(),
  },
  Subscription: {
    numberIncremented: {
      subscribe: () => pubsub.asyncIterator(["NUMBER_INCREMENTED"]),
    },
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();
const httpServer = createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});
const serverCleanup = useServer({ schema }, wsServer);

const server = new ApolloServer({
  schema,
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),

    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

await server.start();
app.use(
  "/graphql",
  cors<cors.CorsRequest>(),
  bodyParser.json(),
  expressMiddleware(server),
);

// Now that our HTTP server is fully set up, actually listen.
httpServer.listen(PORT, () => {
  console.log(`🚀 Query endpoint ready at http://localhost:${PORT}/graphql`);
  console.log(
    `🚀 Subscription endpoint ready at ws://localhost:${PORT}/graphql`,
  );
});

// In the background, increment a number every second and notify subscribers when it changes.
function incrementNumber() {
  currentNumber++;
  pubsub.publish("NUMBER_INCREMENTED", { numberIncremented: currentNumber });
  setTimeout(incrementNumber, 1000);
}

// Start incrementing
incrementNumber();
