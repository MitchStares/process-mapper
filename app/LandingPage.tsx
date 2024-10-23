import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { User } from "@supabase/supabase-js";
import AuthModal from "@/components/AuthModal";

interface LandingPageProps {
  user: User | null;
  setUser: (user: User | null) => void;
  onCallToAction: () => void;
}

export default function LandingPage({ user, setUser, onCallToAction }: LandingPageProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between p-4 bg-white">
        <Link href="/" className="flex items-center space-x-2">
          <svg
            className=" h-6 w-6"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M8 13h2" />
            <path d="M8 17h2" />
            <path d="M14 13h2" />
            <path d="M14 17h2" />
          </svg>
          <span className="font-bold text-xl">Data Process Mapper</span>
        </Link>
        <nav className="flex items-center space-x-4">
          <AuthModal user={user} setUser={setUser} />
          <Button onClick={onCallToAction}>Get Started</Button>
        </nav>
      </header>
      <main className="flex-grow">
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <Image
                src="/images/data-process-mapper.png?height=400&width=600"
                alt="Data Process Map"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="lg:w-1/2 lg:pl-20">
              <h1 className="text-5xl font-bold mb-6">Streamline Your Data Workflows</h1>
              <p className="text-xl mb-8">Create and manage interactive data process maps with ease.</p>
              <Button onClick={onCallToAction} size="lg" className="text-lg px-8 py-4">
                Try It Free
              </Button>
            </div>
          </div>
        </section>
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-4 text-center">Why Choose Data Process Mapper?</h2>
            <p className="text-xl mb-12 text-center text-gray-600">
              Optimize your data handling process with our intuitive mapping tool.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Rapid Mapping",
                  description: "Quickly visualize data flows with drag-and-drop ease.",
                  icon: (
                    <svg
                      className=" h-10 w-10 mb-4"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 2v4" />
                      <path d="M12 18v4" />
                      <path d="M4.93 4.93l2.83 2.83" />
                      <path d="M16.24 16.24l2.83 2.83" />
                      <path d="M2 12h4" />
                      <path d="M18 12h4" />
                      <path d="M4.93 19.07l2.83-2.83" />
                      <path d="M16.24 7.76l2.83-2.83" />
                    </svg>
                  ),
                },
                // {
                //   title: "Collaboration Tools",
                //   description: "Collaborate in real-time with your team for maximum efficiency.",
                //   icon: (
                //     <svg
                //       className=" h-10 w-10 mb-4"
                //       fill="none"
                //       height="24"
                //       stroke="currentColor"
                //       strokeLinecap="round"
                //       strokeLinejoin="round"
                //       strokeWidth="2"
                //       viewBox="0 0 24 24"
                //       width="24"
                //       xmlns="http://www.w3.org/2000/svg"
                //     >
                //       <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                //       <circle cx="9" cy="7" r="4" />
                //       <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                //       <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                //     </svg>
                //   ),
                // },
                {
                  title: "Export Options",
                  description: "Easily export your maps and data in multiple formats.",
                  icon: (
                    <svg
                      className=" h-10 w-10 mb-4"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" x2="12" y1="3" y2="15" />
                    </svg>
                  ),
                },
                {
                  title: "Cloud Saving",
                  description: "Save & restore quickly from a cloud database.",
                  icon: (
                    <svg
                      className="h-10 w-10 mb-4"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                    </svg>
                  ),
                },
              ].map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-primary">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to document your data processes?</h2>
            <p className="text-xl mb-8">Sign up now and transform the way you handle data.</p>
            <Button onClick={onCallToAction} size="lg" className="text-lg px-8 py-4">
              Get Started
            </Button>
          </div>
        </section>
      </main>
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-600">
                © 2024 Data Process Mapper | A <Link href="https://refractiveanalytics.com" className="text-sm text-gray-600 hover:text-gray-900">Refractive Analytics</Link> product. All rights reserved.
              </p>
            </div>
            <nav className="flex space-x-4">
              <Link href="https://refractiveanalytics.com" className="text-sm text-gray-600 hover:text-gray-900">
                About Us
              </Link>
              <Link href="https://refractiveanalytics.com/contact" className="text-sm text-gray-600 hover:text-gray-900">
                Contact
              </Link>
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                Privacy Policy
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}