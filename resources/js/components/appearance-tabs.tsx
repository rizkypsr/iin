import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AppearanceTabs() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>The application uses light theme by default.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 rounded border-2 border-gray-300 bg-white"></div>
                    <span className="text-sm">Light theme (Active)</span>
                </div>
            </CardContent>
        </Card>
    );
}
