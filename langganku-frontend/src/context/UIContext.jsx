import { createContext, useContext } from 'react';

/**
 * Dipakai halaman mana pun untuk membuka form langganan atau dialog konfirmasi.
 *  - openSubscriptionForm(sub?)  : tanpa argumen = tambah, dengan `sub` = ubah
 *  - askConfirm({ title, body, onConfirm })
 */
export const UIContext = createContext(null);
export const useUI = () => useContext(UIContext);
