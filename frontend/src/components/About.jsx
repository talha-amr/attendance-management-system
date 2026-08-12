export default function About() {
  const features = [
    {
      title: "Effortless Tracking",
      description: "Log attendance in seconds with our streamlined interface designed for speed and accuracy in the classroom.",
      icon: "⏱️"
    },
    {
      title: "Comprehensive Reports",
      description: "Generate detailed analytics and exportable reports to keep administration and parents fully informed.",
      icon: "📊"
    },
    {
      title: "Secure & Cloud-Based",
      description: "Access your school's data securely from anywhere, on any device, with real-time cloud synchronization.",
      icon: "☁️"
    }
  ];

  return (
    <section className="w-full bg-white py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        
        <div className="mb-20 max-w-2xl">
          <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Everything you need to run your institution.
          </h2>
          <p className="mt-6 text-xl leading-relaxed text-slate-500">
            Built from the ground up for modern educational environments. We cut the clutter so you can focus on what actually matters: teaching.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 lg:gap-16">
          {features.map((feature, idx) => (
            <div key={idx} className="rounded-3xl bg-slate-50 p-10 transition-shadow hover:shadow-lg hover:shadow-slate-200/50">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-3xl">
                {feature.icon}
              </div>
              <h3 className="mb-4 text-2xl font-bold text-slate-900">
                {feature.title}
              </h3>
              <p className="text-lg leading-relaxed text-slate-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}