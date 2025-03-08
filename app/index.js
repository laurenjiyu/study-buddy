import { useEffect, useState } from "react";

import { Redirect } from "expo-router";

import Login from "@/tabs/Login";
import db from "@/database/db";
import Loading from "@/tabs/Loading";

export default function App() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Default to true for initial load

  useEffect(() => {
    setIsLoading(true);

    db.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = db.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session) {
    return <Redirect href="/TODO/fill/in/route" />;
  } else if (isLoading) {
    return <Loading />;
  } else {
    return <Login />;
  }
}
