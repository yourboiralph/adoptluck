
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "./ui/dialog";

interface OwnedPetsModalProps {
    isOpen: boolean;
    onClose: () => void;
}
export default function OwnedPetsModal({
    isOpen,
    onClose,
}: OwnedPetsModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>OWNED PETS</DialogTitle>
                    <div>
                        
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
