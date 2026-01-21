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
        <Env1 />
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
    <div style={{ textAlign: "left" }}>
      <button
        onClick={() => {
          refetch();
        }}
      >
        refetch env
      </button>
      <div>Env loaded</div>
      {data.e.bs.map((b) => (
        <div key={b.id} style={{ paddingLeft: 16 }}>
          <B id={b.id} />
          {b.ls.map((l) => (
            <div key={l.id} style={{ paddingLeft: 16 }}>
              <L id={l.id} />
              {l.gs.map((g) => (
                <div key={g.id} style={{ paddingLeft: 16 }}>
                  <G id={g.id} />
                  {g.ms.map((m) => (
                    <div key={m.id} style={{ paddingLeft: 16 }}>
                      <M id={m.id} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const GetE1 = gql`
  fragment EField1 on E {
    field1
  }

  fragment BField1 on B {
    field1
  }

  fragment LField1 on L {
    field1
  }

  fragment GField1 on G {
    field1
  }

  fragment MField1 on M {
    field1
  }

  query QueryE {
    e {
      __typename
      id
      name
      ...EField1
      bs {
        __typename
        id
        name
        ...BField1
        ls {
          __typename
          id
          name
          ...LField1
          gs {
            __typename
            id
            name
            ...GField1
            ms {
              __typename
              id
              name
              ...MField1
              is
              vs
            }
          }
        }
      }
    }
  }
`;

function Env1() {
  const { data, loading, refetch } = useQuery(GetE1);

  if (loading) {
    return <div>Env1 loading...</div>;
  }

  return (
    <div>
      <button
        onClick={() => {
          refetch();
        }}
      >
        refetch env1
      </button>
      <div>Env1 loaded</div>
    </div>
  );
}

const GetB = gql`
  query QueryB($id: ID!) {
    b(id: $id) {
      __typename
      id
      name
      field1
      field2
      field3
    }
  }
`;

function B(props) {
  const { data, loading } = useQuery(GetB, { variables: { id: props.id } });

  if (loading) {
    return <div>B({props.id}) loading...</div>;
  }

  return (
    <div>
      <div>B({props.id}) loaded</div>
    </div>
  );
}

const GetL = gql`
  query QueryL($id: ID!) {
    l(id: $id) {
      __typename
      id
      name
      field1
      field2
      field3
    }
  }
`;

function L(props) {
  const { data, loading } = useQuery(GetL, { variables: { id: props.id } });

  if (loading) {
    return <div>L({props.id}) loading...</div>;
  }

  return (
    <div>
      <div>L({props.id}) loaded</div>
    </div>
  );
}

const GetG = gql`
  query QueryG($id: ID!) {
    g(id: $id) {
      __typename
      id
      name
      field1
      field2
      field3
    }
  }
`;

function G(props) {
  const { data, loading } = useQuery(GetG, { variables: { id: props.id } });

  if (loading) {
    return <div>G({props.id}) loading...</div>;
  }

  return (
    <div>
      <div>G({props.id}) loaded</div>
    </div>
  );
}

const GetM = gql`
  query QueryM($id: ID!) {
    m(id: $id) {
      __typename
      id
      name
      is
      vs
      field1
      field2
      field3
    }
  }
`;

function M(props) {
  const { data, loading } = useQuery(GetM, { variables: { id: props.id } });

  if (loading) {
    return <div>M({props.id}) loading...</div>;
  }

  return (
    <div>
      <div>M({props.id}) loaded</div>
      <div style={{ paddingLeft: 16 }}>
        <div>is.length={data.m.is.length}</div>
        <div>vs.length={data.m.vs.length}</div>
      </div>
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
    fetchPolicy: "no-cache",
  });

  return <div>Sub: {!loading && data.numberIncremented}</div>;
}
