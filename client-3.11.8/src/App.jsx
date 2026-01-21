import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { gql, useQuery, useSubscription } from "@apollo/client";

function App() {
  return (
    <>
      <div>
        <a href="#">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="#">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Env + Cake + Cookie</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        <SubNumberInc />
        <Env />
        <Cake />
        <Cookie />
      </div>
    </>
  );
}

export default App;

const GetE = gql`
  query QueryE {
    e {
      __typename
      id
      name
      bs {
        __typename
        id
        name
        ls {
          __typename
          id
          name
          gs {
            __typename
            id
            name
            ms {
              __typename
              id
              name
              is
              vs
            }
          }
        }
      }
    }
  }
`;

function Env() {
  const { data, loading, refetch } = useQuery(GetE);

  if (loading) {
    return <div>Env loading...</div>;
  }

  return (
    <div>
      <button
        onClick={() => {
          refetch();
        }}
      >
        refetch env
      </button>
      <div>Env loaded</div>
    </div>
  );
}

const GetCake = gql`
  query QueryCake {
    cake {
      __typename
      id
      name
    }
  }
`;

function Cake() {
  const { data, loading, refetch } = useQuery(GetCake);

  if (loading) {
    return <div>Cake loading...</div>;
  }

  return (
    <div>
      <button
        onClick={() => {
          refetch();
        }}
      >
        change cake
      </button>
      <div>Cake.id: {data.cake.id}</div>
      <div>Cake.name: {data.cake.name}</div>
    </div>
  );
}

const GetCookie = gql`
  query QueryCookie {
    cookie {
      __typename
      id
      name
    }
  }
`;

function Cookie() {
  const { data, loading, refetch } = useQuery(GetCookie);

  if (loading) {
    return <div>Cake loading...</div>;
  }

  return (
    <div>
      <button
        onClick={() => {
          refetch();
        }}
      >
        change cookie
      </button>
      <div>Cookie.id: {data.cookie.id}</div>
      <div>Cookie.name: {data.cookie.name}</div>
    </div>
  );
}

const Sub = gql`
  subscription SubNumberInc {
    numberIncremented
  }
`;

function SubNumberInc() {
  const { data, loading } = useSubscription(Sub, {
    // fetchPolicy: "no-cache",
  });

  return <div>Sub: {!loading && data.numberIncremented}</div>;
}
