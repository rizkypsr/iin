import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DeleteUser() {
    return (
        <Card className="border-destructive/20">
            <CardHeader>
                <CardTitle className="text-destructive">Delete Account</CardTitle>
                <CardDescription>Once your account is deleted, all of its resources and data will be permanently deleted.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="destructive">Delete Account</Button>
            </CardContent>
        </Card>
    );
}
