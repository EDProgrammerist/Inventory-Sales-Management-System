export interface OrderLine {productId:string;name:string;variant:string;category?:'phones'|'computers'|'consoles';quantity:number;unitPrice:number;total:number;stockReserved:boolean}
export interface OrderAddress {name:string;address:string;phone:string}
export interface OrderShipping {method:'standard'|'express'|'scheduled';date:string}
