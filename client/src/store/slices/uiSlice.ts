import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ModalState {
  isOpen: boolean;
  type: string | null;
  data?: any;
}

interface UIState {
  sidebarOpen: boolean;
  modal: ModalState;
  theme: 'light' | 'dark' | 'system';
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  isComposerOpen: boolean;
  isLoading: boolean;
  toast: {
    message: string | null;
    type: 'success' | 'error' | 'info' | 'warning' | null;
    isVisible: boolean;
  };
}

const initialState: UIState = {
  sidebarOpen: true,
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
  theme: 'system',
  isMobileMenuOpen: false,
  isSearchOpen: false,
  isComposerOpen: false,
  isLoading: false,
  toast: {
    message: null,
    type: null,
    isVisible: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    openModal: (state, action: PayloadAction<{ type: string; data?: any }>) => {
      state.modal = {
        isOpen: true,
        type: action.payload.type,
        data: action.payload.data,
      };
    },
    closeModal: (state) => {
      state.modal = {
        isOpen: false,
        type: null,
        data: null,
      };
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload;
    },
    toggleSearch: (state) => {
      state.isSearchOpen = !state.isSearchOpen;
    },
    setSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.isSearchOpen = action.payload;
    },
    toggleComposer: (state) => {
      state.isComposerOpen = !state.isComposerOpen;
    },
    setComposerOpen: (state, action: PayloadAction<boolean>) => {
      state.isComposerOpen = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    showToast: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' | 'warning' }>) => {
      state.toast = {
        message: action.payload.message,
        type: action.payload.type,
        isVisible: true,
      };
    },
    hideToast: (state) => {
      state.toast = {
        ...state.toast,
        isVisible: false,
      };
    },
    resetToast: (state) => {
      state.toast = {
        message: null,
        type: null,
        isVisible: false,
      };
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  openModal,
  closeModal,
  setTheme,
  toggleMobileMenu,
  setMobileMenuOpen,
  toggleSearch,
  setSearchOpen,
  toggleComposer,
  setComposerOpen,
  setLoading,
  showToast,
  hideToast,
  resetToast,
} = uiSlice.actions;

export default uiSlice.reducer;