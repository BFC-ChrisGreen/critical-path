import { useEffect, useState } from 'react';
import { useGameStore, loadSavedGame } from './store';
import { Intro } from './screens/Intro';
import { Personality } from './screens/Personality';
import { CharacterCreation } from './screens/CharacterCreation';
import { Kickoff } from './screens/Kickoff';
import { Weekbeat } from './screens/Weekbeat';
import { Debrief } from './screens/Debrief';

function App() {
  const screen = useGameStore((s) => s.screen);
  const project = useGameStore((s) => s.project);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadSavedGame();
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">
          Critical <span>Path</span>
        </div>
        {screen === 'weekbeat' || screen === 'debrief' ? (
          <div className="status">
            {project.name} &middot; week {Math.min(project.week, project.durationWeeks)} / {project.durationWeeks}
          </div>
        ) : (
          <div className="status">a project management career sim</div>
        )}
      </div>

      {screen === 'intro' && <Intro />}
      {screen === 'personality' && <Personality />}
      {screen === 'create' && <CharacterCreation />}
      {screen === 'kickoff' && <Kickoff />}
      {screen === 'weekbeat' && <Weekbeat />}
      {screen === 'debrief' && <Debrief />}
    </div>
  );
}

export default App;
