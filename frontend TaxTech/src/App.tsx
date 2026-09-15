import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'

import Dashboard from './views/Dashboard'
import Movimientos from './views/Movimientos'
import Deducciones from './views/Deducciones'
import Impuestos from './views/Impuestos'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="movimientos" element={<Movimientos />} />
        <Route path="deducciones" element={<Deducciones />} />
        <Route path="impuestos" element={<Impuestos />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App