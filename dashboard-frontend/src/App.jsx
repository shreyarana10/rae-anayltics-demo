import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Finance from "./Finance";
import Building from "./Building";
import Industrial from "./Industrial";
import IT from "./IT";
import Business from "./Business_administration";
import Sales from "./Sales";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Finance />
            </Layout>
          }
        />
        <Route
          path="/finance"
          element={
            <Layout>
              <Finance />
            </Layout>
          }
        />
        <Route
          path="/building"
          element={
            <Layout>
              <Building />
            </Layout>
          }
        />
        <Route
          path="/industrial"
          element={
            <Layout>
              <Industrial />
            </Layout>
          }
        />
        <Route
          path="/it"
          element={
            <Layout>
              <IT />
            </Layout>
          }
        />
        <Route
          path="/business"
          element={
            <Layout>
              <Business />
            </Layout>
          }
        />
        <Route
          path="/sales"
          element={
            <Layout>
              <Sales />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
