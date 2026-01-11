'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Sidebar, MainPanel, TripTabs } from '@/components/layout';
import { TransportModal, TransportCard, TransportImportModal, CarRentalModal, CarRentalCard } from '@/components/bookings';
import { Train, Bus, Car, Plus, Upload, Truck } from 'lucide-react';
import { getTrains, deleteTrain, getCars, deleteCar } from '@/lib/dataService';
import { Train as TrainType, CarRental } from '@/types';

type TransportFilter = 'all' | 'car' | 'train' | 'bus';
type ModalType = 'car' | 'train' | 'bus' | null;

// Unified type for display
interface TransportItem {
    type: 'car' | 'train' | 'bus';
    id: string;
    sortDate: Date;
    data: TrainType | CarRental;
}

export default function TransportationPage() {
    const params = useParams();
    const tripId = params.tripId as string;

    const [transports, setTransports] = useState<TrainType[]>([]);
    const [cars, setCars] = useState<CarRental[]>([]);
    const [filter, setFilter] = useState<TransportFilter>('all');

    // Modals
    const [openModal, setOpenModal] = useState<ModalType>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingTransport, setEditingTransport] = useState<TrainType | null>(null);
    const [editingCar, setEditingCar] = useState<CarRental | null>(null);

    const refreshData = () => {
        setTransports(getTrains(tripId));
        setCars(getCars(tripId));
    };

    useEffect(() => {
        refreshData();
    }, [tripId]);

    const handleDeleteTransport = (id: string) => {
        if (confirm('Delete this booking?')) {
            deleteTrain(id);
            refreshData();
        }
    };

    const handleDeleteCar = (id: string) => {
        if (confirm('Delete this rental?')) {
            deleteCar(id);
            refreshData();
        }
    };

    const handleEditTransport = (transport: TrainType) => {
        setEditingTransport(transport);
        setOpenModal(transport.type);
    };

    const handleEditCar = (car: CarRental) => {
        setEditingCar(car);
        setOpenModal('car');
    };

    const handleCloseModals = () => {
        setOpenModal(null);
        setEditingTransport(null);
        setEditingCar(null);
    };

    // Combine and sort all items
    const allItems: TransportItem[] = [
        ...cars.map(car => ({
            type: 'car' as const,
            id: car.id,
            sortDate: new Date(car.pickupDateTime),
            data: car as CarRental
        })),
        ...transports.map(t => ({
            type: t.type,
            id: t.id,
            sortDate: new Date(t.departureDateTime),
            data: t as TrainType
        }))
    ].sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime());

    const filteredItems = filter === 'all'
        ? allItems
        : allItems.filter(item => item.type === filter);

    const carCount = cars.length;
    const trainCount = transports.filter(t => t.type === 'train').length;
    const busCount = transports.filter(t => t.type === 'bus').length;

    return (
        <>
            <Sidebar />
            <MainPanel
                title="Transportation"
                subtitle="Manage cars, trains, and buses"
                actions={
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsImportModalOpen(true)}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Upload className="w-5 h-5" /> Import PDF
                        </button>
                        <div className="relative group">
                            <button className="btn-primary flex items-center gap-2">
                                <Plus className="w-5 h-5" /> Add
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-[#1E293B] border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                <button
                                    onClick={() => setOpenModal('car')}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/5 hover:text-white transition-colors rounded-t-xl"
                                >
                                    <Car className="w-4 h-4 text-[var(--accent-purple)]" /> Car Rental
                                </button>
                                <button
                                    onClick={() => setOpenModal('train')}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                                >
                                    <Train className="w-4 h-4 text-[var(--accent-orange)]" /> Train
                                </button>
                                <button
                                    onClick={() => setOpenModal('bus')}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/5 hover:text-white transition-colors rounded-b-xl"
                                >
                                    <Bus className="w-4 h-4 text-[var(--accent-green)]" /> Bus
                                </button>
                            </div>
                        </div>
                    </div>
                }
            >
                <TripTabs tripId={tripId} />

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl w-fit">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${filter === 'all' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
                    >
                        All ({allItems.length})
                    </button>
                    <button
                        onClick={() => setFilter('car')}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-all ${filter === 'car' ? 'bg-[var(--accent-purple)]/20 text-[var(--accent-purple)]' : 'text-white/50 hover:text-white'}`}
                    >
                        <Car className="w-4 h-4" /> Cars ({carCount})
                    </button>
                    <button
                        onClick={() => setFilter('train')}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-all ${filter === 'train' ? 'bg-[var(--accent-orange)]/20 text-[var(--accent-orange)]' : 'text-white/50 hover:text-white'}`}
                    >
                        <Train className="w-4 h-4" /> Trains ({trainCount})
                    </button>
                    <button
                        onClick={() => setFilter('bus')}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-all ${filter === 'bus' ? 'bg-[var(--accent-green)]/20 text-[var(--accent-green)]' : 'text-white/50 hover:text-white'}`}
                    >
                        <Bus className="w-4 h-4" /> Buses ({busCount})
                    </button>
                </div>

                {/* Content */}
                {filteredItems.length === 0 ? (
                    <div className="glass-panel p-12 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent-purple)]/20 via-[var(--accent-orange)]/20 to-[var(--accent-green)]/20 mx-auto mb-6 flex items-center justify-center">
                            <Truck className="w-10 h-10 text-white/60" />
                        </div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                            {filter === 'all' ? 'No Transportation Yet' : `No ${filter === 'car' ? 'Car Rentals' : filter === 'train' ? 'Trains' : 'Buses'} Yet`}
                        </h2>
                        <p className="text-[var(--text-secondary)] mb-6">
                            Add your car rentals, train tickets, and bus bookings.
                        </p>
                        <button
                            onClick={() => setOpenModal('car')}
                            className="btn-primary"
                        >
                            <Plus className="w-4 h-4 mr-2 inline" /> Add Transportation
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredItems.map(item => {
                            if (item.type === 'car') {
                                const car = item.data as CarRental;
                                return (
                                    <CarRentalCard
                                        key={car.id}
                                        car={car}
                                        onEdit={() => handleEditCar(car)}
                                        onDelete={() => handleDeleteCar(car.id)}
                                    />
                                );
                            } else {
                                const transport = item.data as TrainType;
                                return (
                                    <TransportCard
                                        key={transport.id}
                                        transport={transport}
                                        onEdit={() => handleEditTransport(transport)}
                                        onDelete={() => handleDeleteTransport(transport.id)}
                                    />
                                );
                            }
                        })}
                    </div>
                )}
            </MainPanel>

            {/* Car Rental Modal */}
            <CarRentalModal
                isOpen={openModal === 'car' && !editingTransport}
                onClose={handleCloseModals}
                tripId={tripId}
                car={editingCar}
                onSave={refreshData}
            />

            {/* Train/Bus Modal */}
            <TransportModal
                isOpen={(openModal === 'train' || openModal === 'bus') && !editingCar}
                onClose={handleCloseModals}
                tripId={tripId}
                transport={editingTransport}
                defaultType={openModal === 'bus' ? 'bus' : 'train'}
                onSave={refreshData}
            />

            {/* Import Modal */}
            <TransportImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                tripId={tripId}
                onImported={refreshData}
            />
        </>
    );
}
