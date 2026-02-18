import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
    const navigate = useNavigate();

    return (
        <footer className="bg-gray-900 text-white pt-20 pb-10 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <img
                                src="/Logo Nkiza Center.png"
                                alt="Nkiza Center Logo"
                                className="h-20 w-auto object-contain brightness-0 invert"
                            />
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-8">
                            Nkiza Academic Publishing specializes in multidisciplinary research dissemination, providing a robust platform for authors to share findings with a global community of scholars.
                        </p>
                        <div className="flex gap-4">
                            <a className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all" href="#">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
                            </a>
                            <a className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all" href="#">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
                            </a>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-6">Library</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><button onClick={() => navigate('/journals')} className="hover:text-white transition-colors">Journals</button></li>
                            <li><button onClick={() => navigate('/books')} className="hover:text-white transition-colors">Books & Monographs</button></li>
                            <li><button onClick={() => navigate('/about')} className="hover:text-white transition-colors">About Us</button></li>
                            <li><button onClick={() => navigate('/contact')} className="hover:text-white transition-colors">Contact Us</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-6">Authors</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><button onClick={() => navigate('/dashboard/submit')} className="hover:text-white transition-colors">Submission Portal</button></li>
                            <li><button onClick={() => navigate('/dashboard/post-book')} className="hover:text-white transition-colors">Post a Book</button></li>
                            <li><button onClick={() => navigate('/book-guidelines')} className="hover:text-white transition-colors">Book Guidelines</button></li>
                            <li><button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
                            <li><button onClick={() => navigate('/copyright')} className="hover:text-white transition-colors">Copyright & Terms</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-6">Newsletter</h4>
                        <p className="text-xs text-gray-400 mb-4 uppercase tracking-wide">Receive latest research alerts.</p>
                        <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                            <div className="relative flex-grow">
                                <input className="w-full bg-gray-800 text-white text-sm border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-gray-600" placeholder="Email address" type="email" />
                            </div>
                            <button type="submit" className="bg-primary hover:bg-blue-600 text-white rounded-lg px-3 py-2 transition-colors flex items-center justify-center">
                                <span className="material-symbols-outlined text-lg">send</span>
                            </button>
                        </form>
                    </div>
                </div>
                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                    <p>© 2026 Nkiza Center for Research (NCR). All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0 uppercase tracking-wider">
                        <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">Privacy</button>
                        <button onClick={() => navigate('/copyright')} className="hover:text-white transition-colors">Terms</button>
                        <button onClick={() => navigate('/about')} className="hover:text-white transition-colors">About</button>
                        <button onClick={() => navigate('/partners')} className="hover:text-white transition-colors">Partners</button>
                        <button onClick={() => navigate('/contact')} className="hover:text-white transition-colors">Contact</button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
