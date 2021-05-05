import { State } from "interface";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actionCreators } from "store";
import "./App.css";

function App() {
  const dispatch = useDispatch();
  const { a, b, c } = useSelector<State, State>((state) => state);

  const onChangeA = useCallback(() => {
    dispatch(actionCreators.a.Array_push(0));
  }, [dispatch]);

  const onChangeB = useCallback(() => {
    dispatch(actionCreators.b.Boolean_toggle);
  }, [dispatch]);

  const onChangeC = useCallback(() => {
    dispatch(actionCreators.c.Object_set_property("a", 1));
  }, [dispatch]);

  return (
    <div className="App">
      <button onClick={onChangeA}>Current a: {JSON.stringify(a)}</button>
      <button onClick={onChangeB}>Current b: {JSON.stringify(b)}</button>
      <button onClick={onChangeC}>Current c: {JSON.stringify(c)}</button>
    </div>
  );
}

export default App;
