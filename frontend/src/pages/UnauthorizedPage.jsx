import { Link } from "react-router-dom";

const UnauthorizedPage = () => (
  <div className="page-shell flex items-center justify-center">
    <div className="glass-card w-full max-w-lg p-8 text-center">
      <h1 className="mb-2 text-4xl font-extrabold text-slate-900">403</h1>
      <p className="mb-1 text-xl font-semibold text-slate-800">Unauthorized</p>
      <p className="mb-6 text-slate-600">You do not have permission to view this page.</p>
      <Link to="/" className="btn-primary inline-flex">
        Go Home
      </Link>
    </div>
  </div>
);

export default UnauthorizedPage;
