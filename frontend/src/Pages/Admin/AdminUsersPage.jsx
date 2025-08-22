import React, { useState, useEffect } from 'react';
import { FiTrash2, FiUserCheck, FiUserX } from 'react-icons/fi';
import userService from '../../services/userService';

const AdminUsersPage = () => {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userService.getAllUsers();
        if (res.data.success) setUsers(res.data.users);
      } catch (err) {
        // pass only one arg to state setter
        setError('Failed to load users',err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Confirm first (sync), then do async delete work.
  const handleDeleteClick = (e, userId) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    const ok = window.confirm('Are you sure you want to delete this user?');
    if (!ok) return;

    (async () => {
      try {
        await userService.deleteUser(userId);
        setUsers(prev => prev.filter(u => u._id !== userId));
      } catch {
        alert('Delete failed');
      }
    })();
  };

  if (loading) return <div className="text-center py-10">Loading users...</div>;
  if (error)   return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">Manage Users</h1>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center space-x-4">
                    <button
                      type="button"
                      onClick={(e) => handleDeleteClick(e, user._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete user"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
