import * as React from "react";

export const ModularContext = React.createContext({
  modules: [],
  setModules: () => {},
  popUpState: {},
  setPopUpState: {},
});
