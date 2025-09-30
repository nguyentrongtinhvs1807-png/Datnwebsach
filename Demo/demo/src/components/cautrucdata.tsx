export interface ILoai {
    id: number;
    ten_loai: string;
    thu_tu: number;
    an_hien: number;
}

export interface ISanPham {
    id: number;
    ten_sp: string;
    gia: number;
    gia_km: number;
    ngay: string;
    hinh: string;
    id_loai: number;
    luot_xem: number;
    hot: string;
    an_hien: string;
    tinh_chat: string;
}
