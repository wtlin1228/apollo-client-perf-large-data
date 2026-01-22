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

const BS = 2;
const LS = 2;
const GS = 3;
const MS = 3;
const IS = 4_000;
const VS = 4_000;

const all_bs = [];
const all_ls = [];
const all_gs = [];
const all_ms = [];

const e = {
  id: "e1",
  name: "E1",
  bs: all_bs,
  field1: "e1 field1",
  field2: "e1 field2",
  field3: "e1 field3",
};

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
        const data = {
          id: `m_${b}_${l}_${g}_${m}`,
          name: `M_${b}_${l}_${g}_${m}`,
          is,
          vs,
          field1: `m_${b}_${l}_${g}_${m} field1`,
          field2: `m_${b}_${l}_${g}_${m} field2`,
          field3: `m_${b}_${l}_${g}_${m} field3`,
        };
        ms.push(data);
        all_ms.push(data);
      }
      const data = {
        id: `g_${b}_${l}_${g}`,
        name: `G_${b}_${l}_${g}`,
        ms,
        field1: `g_${b}_${l}_${g} field1`,
        field2: `g_${b}_${l}_${g} field2`,
        field3: `g_${b}_${l}_${g} field3`,
      };
      gs.push(data);
      all_gs.push(data);
    }
    const data = {
      id: `l_${b}_${l}`,
      name: `L_${b}_${l}`,
      gs,
      field1: `l_${b}_${l} field1`,
      field2: `l_${b}_${l} field2`,
      field3: `l_${b}_${l} field3`,
    };
    ls.push(data);
    all_ls.push(data);
  }
  all_bs.push({
    id: `b_${b}`,
    name: `B_${b}`,
    ls,
    field1: `b_${b} field1`,
    field2: `b_${b} field2`,
    field3: `b_${b} field3`,
  });
}

const typeDefs = `#graphql
  type E {
    id: ID
    name: String
    bs: [B]

    field1: String
    field2: String
    field3: String
  }

  type B {
    id: ID
    name: String
    ls: [L]

    field1: String
    field2: String
    field3: String
  }

  type L {
    id: ID
    name: String
    gs: [G]

    field1: String
    field2: String
    field3: String
  }

  type G {
    id: ID
    name: String
    ms: [M]

    field1: String
    field2: String
    field3: String
  }

  type M {
    id: ID
    name: String
    is: [Float]
    vs: [Float]

    field1: String
    field2: String
    field3: String
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
    b(id: ID!): B
    l(id: ID!): L
    g(id: ID!): G
    m(id: ID!): M
    cake: Cake
    cookie: Cookie
  }

  type Subscription {
    numberIncremented: Int
  }
`;

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
    b: (_, args) => all_bs.find((x) => x.id === args.id),
    l: (_, args) => all_ls.find((x) => x.id === args.id),
    g: (_, args) => all_gs.find((x) => x.id === args.id),
    m: (_, args) => all_ms.find((x) => x.id === args.id),
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
