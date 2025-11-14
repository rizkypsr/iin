import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download } from 'lucide-react';
import React from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { IinNasionalApplication, IinSingleBlockholderApplication, PengawasanIinNasionalApplication, PengawasanSingleIinApplication } from '@/types';

interface ReimModalProps {
    isOpen: boolean;
    onClose: () => void;
    application: IinSingleBlockholderApplication | IinNasionalApplication | PengawasanIinNasionalApplication | PengawasanSingleIinApplication;
    type: 'iin' | 'single' | 'pengawasan-iin' | 'pengawasan-single';
}


const ReimModal: React.FC<ReimModalProps> = ({ isOpen, onClose, application, type }) => {
    const expense = application.expense_reimbursement;
    const formatCurrency = (value?: number) =>
        typeof value === 'number'
            ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
            : '-';

    function finalRoute() {
        switch (type) {
            case 'iin': return route('iin-nasional.download-file', { iinNasional: application.id, type: 'expense_reimbursement' });
            case 'single': return route('iin-single-blockholder.download-file', { iinSingleBlockholder: application.id, type: 'expense_reimbursement' });
            case 'pengawasan-iin': return route('pengawasan-iin-nasional.download-file', { pengawasanIinNasional: application.id, type: 'expense_reimbursement' });
            case 'pengawasan-single': return route('pengawasan-single-iin.download-file', { pengawasanSingleIin: application.id, type: 'expense_reimbursement' });
        }
    }

    const handleDownload = () => {
        const route = finalRoute();
        window.open(
            route,
            '_blank'
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Bukti Penggantian Transport dan Uang Harian</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-sm text-gray-500">Nama Perusahaan</p>
                            <p className="text-sm font-medium">{expense?.company_name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Nama PIC</p>
                            <p className="text-sm font-medium">{expense?.pic_name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Kontak PIC</p>
                            <p className="text-sm font-medium">{expense?.pic_contact || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tanggal Verifikasi</p>
                            <p className="text-sm font-medium">
                                {expense?.verification_date
                                    ? format(new Date(expense.verification_date), 'dd MMMM yyyy', { locale: id })
                                    : '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Disetujui</p>
                            <p className="text-sm font-medium">{expense?.is_acknowledged ? 'Ya' : 'Tidak'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Nominal Ketua Verifikator</p>
                            <p className="text-sm font-medium">{formatCurrency(expense?.chief_verificator_amount)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Nominal Anggota Verifikator</p>
                            <p className="text-sm font-medium">{formatCurrency(expense?.member_verificator_amount)}</p>
                        </div>
                    </div>
                </div>
                <DialogFooter className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleDownload}
                        disabled={!expense?.payment_proof_path}
                    >
                        <Download className="mr-2 w-4 h-4" />
                        Download Bukti Pembayaran
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ReimModal;
