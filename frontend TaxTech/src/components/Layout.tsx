import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

function Layout() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100 md:flex-row">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout