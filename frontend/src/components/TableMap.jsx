import { useState, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';
import { io } from 'socket.io-client';
import axios from 'axios';
import PosPanel from './PosPanel';
import LiveDashboard from './LiveDashboard'; // BUNU EKLİYORSUN

const socket = io('http://localhost:5000');

// Sistem Bilgisi: isEditMode prop'u ile Yönetim ve Satış ekranı davranışları ayrıştırıldı
const TableMap = ({ isEditMode = false }) => {
    const [tables, setTables] = useState([]);
    const [newTableName, setNewTableName] = useState('');
    const [selectedTable, setSelectedTable] = useState(null);


    // SİSTEM BİLGİSİ: Radar Motoru (Masaları Çek)
    const fetchTables = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/tables');
            setTables(res.data);
        } catch (err) {
            console.error('Masalar çekilemedi', err);
        }
    };

    useEffect(() => {
        fetchTables();

        socket.on('updateTables', () => {
            fetchTables();
        });

        return () => {
            socket.off('updateTables');
        };
    }, []);

    const handleAddTable = async (e) => {
        e.preventDefault();
        if (!newTableName) return;

        try {
            console.log(`Sistem Bilgisi: Yeni masa oluşturuluyor. İsim: ${newTableName}`);
            await axios.post('http://localhost:5000/api/tables', {
                name: newTableName,
                canvas_x: 50,
                canvas_y: 50
            });
            setNewTableName('');
            fetchTables();
        } catch (error) {
            console.error('Sistem Hatası: Masa oluşturma işlemi başarısız.', error);
        }
    };

    const handleDragEnd = async (e, id) => {
        if (!isEditMode) return; // Satış ekranındaysa sürüklemeyi siktir et

        const newX = Math.round(e.target.x());
        const newY = Math.round(e.target.y());

        setTables(tables.map(t => t.id === id ? { ...t, canvas_x: newX, canvas_y: newY } : t));

        try {
            console.log(`Sistem Bilgisi: Masa konumu güncellendi. ID: ${id}`);
            await axios.put(`http://localhost:5000/api/tables/${id}/position`, {
                canvas_x: newX,
                canvas_y: newY
            });
        } catch (error) {
            console.error('Sistem Hatası: Konum kaydedilemedi.', error);
        }
    };

    const getTableColor = (status) => {
        switch (status) {
            case 'Dolu': return '#ff4444'; // Kan kırmızı
            case 'Rezerve': return '#ffc107'; // Sarı
            default: return '#28a745'; // Boş ise Yemyeşil
        }
    };

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            {/* Sadece Düzenleme (Dashboard) modundaysa masa ekleme barını göster */}
            {isEditMode && (
                <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Yeni Masa Adı (Örn: Loca 1)"
                        value={newTableName}
                        onChange={(e) => setNewTableName(e.target.value)}
                        style={{ width: '300px', margin: 0 }}
                    />
                    <button onClick={handleAddTable} style={{ width: '150px', padding: '15px' }}>MASA DİZ</button>
                </div>
            )}

            {/* Canvas Çizim Alanı */}
            <div style={{ flex: 1, backgroundColor: '#0d0d0d', border: isEditMode ? '2px dashed #333' : '2px solid #222', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                <Stage width={1500} height={900}>
                    <Layer>
                        {tables.map((table) => (
                            <Group
                                key={table.id}
                                x={table.canvas_x}
                                y={table.canvas_y}
                                draggable={isEditMode} // Sadece Dashboard'da sürüklenebilir
                                onDragEnd={(e) => handleDragEnd(e, table.id)}
                                onClick={() => !isEditMode && setSelectedTable(table)} // Sadece Satış ekranında tıklanınca panel açılır
                                onTap={() => !isEditMode && setSelectedTable(table)}
                            >
                                <Rect
                                    width={100}
                                    height={100}
                                    fill={getTableColor(table.status)}
                                    stroke={isEditMode ? "#888" : "var(--primary-color)"} // Düzenlemede gri, satışta altın sarısı çerçeve
                                    strokeWidth={2}
                                    cornerRadius={10}
                                    shadowColor="black"
                                    shadowBlur={10}
                                />
                                <Text
                                    text={table.name}
                                    fontSize={16}
                                    fontFamily="Montserrat"
                                    fill="white"
                                    fontStyle="bold"
                                    width={100}
                                    align="center"
                                    verticalAlign="middle"
                                    height={100}
                                />
                            </Group>
                        ))}
                    </Layer>
                </Stage>
            </div>

            {/* BÜTÜN BÜYÜ BURADA: Sadece Satış Modundaysa ve Masa Seçili DEĞİLSE sağda LiveDashboard'u göster */}
            {!isEditMode && !selectedTable && (
                <LiveDashboard />
            )}

            {/* Sadece Satış Modundaysa ve Masa Seçildiyse Adisyon Panelini Aç */}
            {!isEditMode && selectedTable && (
                <PosPanel
                    table={selectedTable}
                    onClose={() => setSelectedTable(null)}
                    onUpdate={fetchTables}
                />
            )}

        </div>
    );
};

export default TableMap;