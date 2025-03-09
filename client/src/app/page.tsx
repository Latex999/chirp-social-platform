import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <main className="flex-grow flex flex-col md:flex-row items-center justify-center p-6 md:p-24 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
        <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to <span className="text-primary-600 dark:text-primary-400">Chirp</span>
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            Connect with friends, share your thoughts, and discover what's happening in the world right now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/signup" 
              className="chirp-button-primary text-center py-3 px-8 text-lg"
            >
              Sign Up
            </Link>
            <Link 
              href="/login" 
              className="chirp-button-secondary text-center py-3 px-8 text-lg"
            >
              Log In
            </Link>
          </div>
        </div>
        <div className="md:w-1/2 relative">
          <div className="w-full h-[400px] md:h-[500px] relative">
            <Image
              src="https://via.placeholder.com/800x800?text=Chirp+Platform"
              alt="Chirp Platform"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white dark:bg-gray-900">
        <div className="chirp-container">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Why Choose Chirp?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="chirp-card hover:shadow-md">
              <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Real-time Conversations</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Engage in real-time conversations with friends, family, and people around the world.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="chirp-card hover:shadow-md">
              <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Discover Trends</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Stay up-to-date with trending topics and discover content that matters to you.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="chirp-card hover:shadow-md">
              <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Privacy & Security</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your data is protected with industry-leading security measures and privacy controls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-800 py-8">
        <div className="chirp-container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400">Chirp</h3>
              <p className="text-gray-600 dark:text-gray-400">Connect and share with the world</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                About
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                Privacy
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                Terms
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                Help
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Chirp. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}