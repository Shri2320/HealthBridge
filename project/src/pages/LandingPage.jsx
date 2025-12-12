import { Users, UserCog, Shield, Stethoscope } from 'lucide-react';

const LandingPage = ({ onRoleSelect }) => {
  const roles = [
    {
      id: 'patient',
      title: 'Patient',
      description: 'Book appointments, upload documents, and manage your healthcare',
      icon: Users,
      color: 'from-[#00235B] to-[#0066B2]'
    },
    {
      id: 'doctor',
      title: 'Doctor',
      description: 'View appointments, patient records, and manage consultations',
      icon: Stethoscope,
      color: 'from-[#0066B2] to-[#00A8E8]'
    },
    {
      id: 'admin',
      title: 'Admin',
      description: 'Manage hospital operations, doctors, and department statistics',
      icon: UserCog,
      color: 'from-[#00A8E8] to-[#40C9FF]'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00235B] via-[#0066B2] to-[#00A8E8]">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-16 h-16 text-[#A0E7FF]" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Healthbridge
          </h1>
          <p className="text-xl text-[#A0E7FF] max-w-2xl mx-auto">
            Comprehensive healthcare management system for patients, doctors, and administrators
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => onRoleSelect(role.id)}
                className="group relative bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>

                <div className="relative">
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${role.color} mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <h2 className="text-2xl font-bold text-[#00235B] mb-3">
                    {role.title}
                  </h2>

                  <p className="text-gray-600 leading-relaxed">
                    {role.description}
                  </p>

                  <div className="mt-6 inline-flex items-center text-[#0066B2] font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    Continue
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => onRoleSelect('developer')}
            className="text-[#A0E7FF] hover:text-white underline transition-colors duration-300"
          >
            Developer Access
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

