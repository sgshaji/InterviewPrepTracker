import { Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  // Always render the component, bypassing auth
  return <Route path={path} component={Component} />;
}