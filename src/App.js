import './App.css';
import 'devextreme/dist/css/dx.light.css';
import Schedule from './components/Schedule';
import Members from './components/Members';

function App() {
  return (
    <div className="App">
      <Members className="site"/>
      <Schedule className="site"/>
    </div>
  );
}

export default App;
