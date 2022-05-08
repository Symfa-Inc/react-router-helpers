import React from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import "./App.css";
import { helper, RouteHelper } from "./reactRouterHelpers";

function Home() {
  return (
    <div>
      <h1>Home</h1>
      <nav>
        <Link to="/">Home</Link> |{" "}
        <Link to="about">About</Link>
      </nav>
    </div>
  );
}

function App() {
  helper();


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={new RouteHelper(<Home />).create()}>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
