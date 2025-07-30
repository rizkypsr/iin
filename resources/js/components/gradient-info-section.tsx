import { Button } from '@/components/ui/button';

interface GradientInfoSectionProps {
    title: string;
    subtitle: string;
    description: string;
    buttonText: string;
    onButtonClick?: () => void;
}

export function GradientInfoSection({ title, subtitle, description, buttonText, onButtonClick }: GradientInfoSectionProps) {
    return (
        <div className="bg-gradient-secondary relative overflow-hidden py-16">
            {/* Subtle line pattern overlay */}
            <div className="absolute inset-0 opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                        linear-gradient(45deg, rgba(255,255,255,0.1) 1px, transparent 1px),
                        linear-gradient(-45deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                    `,
                        backgroundSize: '30px 30px',
                    }}
                ></div>
            </div>

            <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                <h2 className="mb-4 text-4xl font-bold text-white drop-shadow-lg">{title}</h2>
                <p className="mb-6 text-xl text-white/90 drop-shadow">{subtitle}</p>
                <p className="mx-auto mb-8 max-w-2xl leading-relaxed text-white/80">{description}</p>

                <Button
                    variant="outline"
                    size="lg"
                    className="border-white bg-white/10 text-white hover:bg-white hover:text-purple-700"
                    onClick={onButtonClick}
                >
                    {buttonText}
                </Button>
            </div>
        </div>
    );
}
