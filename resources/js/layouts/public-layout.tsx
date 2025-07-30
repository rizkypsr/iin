import { TopNav } from '@/components/top-nav';
import { type ReactNode } from 'react';

interface PublicLayoutProps {
    children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    return (
        <div className="min-h-screen bg-white">
            <TopNav />
            <main>{children}</main>

            {/* Gradient Footer */}
            <footer className="bg-gradient-footer mt-20 py-12">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 text-white md:grid-cols-3">
                        <div>
                            <h3 className="mb-4 text-lg font-semibold">Portal Layanan Otoritas Sponsor</h3>
                            <p className="text-sm leading-relaxed text-white/80">
                                Sistem terpadu untuk registrasi dan manajemen Identitas Investasi Nasional di Indonesia.
                            </p>
                        </div>
                        <div>
                            <h3 className="mb-4 text-lg font-semibold">Layanan</h3>
                            <ul className="space-y-2 text-sm text-white/80">
                                <li>IIN Nasional</li>
                                <li>Single IIN</li>
                                <li>Blockholder</li>
                                <li>Pengawasan</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-4 text-lg font-semibold">Kontak</h3>
                            <div className="space-y-2 text-sm text-white/80">
                                <p>Email: info@iin.go.id</p>
                                <p>Telepon: +62 21 1234 5678</p>
                                <p>Alamat: Jakarta, Indonesia</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer separator line */}
                    <div className="mt-8 border-t border-white/20 pt-8 text-center">
                        <p className="text-sm text-white/60">© 2025 Portal Layanan Otoritas Sponsor.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
