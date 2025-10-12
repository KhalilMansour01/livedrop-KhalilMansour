import { BrowserRouter as Router } from 'react-router-dom'
import Layout from './components/templates/layout'
import { AppRouter } from './lib/router'

function App() {
  return (
    <Router>
      <Layout>
        <AppRouter />
      </Layout>
    </Router>
  )
}

export default App
