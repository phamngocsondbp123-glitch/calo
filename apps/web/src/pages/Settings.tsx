import { useAuth } from '../store/auth';

export function Settings() {
  const { user, logout } = useAuth();
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-black">Profile settings</h1>
      <div className="card">
        <p><b>{user?.name}</b></p>
        <p className="text-slate-500">{user?.email}</p>
        <button className="btn mt-4" onClick={logout} type="button">Đăng xuất</button>
      </div>
    </section>
  );
}
