import { useState } from 'react';
import { Layout, ProfessionalForm, ProfessionalsTable } from './components';
import { GlobalStyle } from './styles/globalStyles';

function App() {
  const [view, setView] = useState<'list' | 'add'>('list');

  return (
    <>
      <GlobalStyle />
      <Layout onNavigate={setView}>
        {view === 'list' ? <ProfessionalsTable /> : <ProfessionalForm />}
      </Layout>
    </>
  );
}

export default App;
