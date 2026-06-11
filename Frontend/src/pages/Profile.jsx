import { useAuthStore } from '../store/authStore';
import Navbar from '../components/layout/Navbar';
import { RoleBadge, VerifiedBadge } from '../components/ui/Badge';

export default function Profile() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-12 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="font-display text-3xl text-[color:var(--color-text-1)]">Profile</h1>

          <div className="p-8 rounded-2xl" style={{ background: 'var(--color-card)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center font-display text-4xl"
                style={{ background: 'var(--color-elevated)', border: '2px solid var(--color-amber)', color: 'var(--color-amber)' }}
              >
                {user.username?.[0]?.toUpperCase()}
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-2xl text-[color:var(--color-text-1)]">
                    {user.first_name} {user.last_name}
                  </h2>
                  <RoleBadge role={user.role} />
                  <VerifiedBadge isVerified={user.is_verified} />
                </div>
                
                <p className="font-sans text-[color:var(--color-text-2)]">@{user.username}</p>
                <p className="font-sans text-[color:var(--color-text-2)]">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-2xl" style={{ background: 'var(--color-card)', border: '1px solid var(--border-subtle)' }}>
             <h3 className="font-display text-xl mb-4 text-[color:var(--color-text-1)]">Account Settings</h3>
             <p className="font-sans text-sm text-[color:var(--color-text-3)] mb-4">Password management and other settings go here.</p>
             <button
               className="px-4 py-2 rounded-lg font-sans text-sm transition-colors cursor-pointer"
               style={{ background: 'transparent', border: '1px solid var(--border-hover)', color: 'var(--color-amber)' }}
               onClick={() => alert('Change password flow')}
             >
               Change Password
             </button>
          </div>
        </div>
      </main>
    </>
  );
}
