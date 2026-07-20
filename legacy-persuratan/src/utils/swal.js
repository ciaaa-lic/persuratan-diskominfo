import Swal from 'sweetalert2'

// Custom theme matching our Red SaaS design
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer
    toast.onmouseleave = Swal.resumeTimer
  },
  customClass: {
    popup: 'swal-toast-custom'
  }
})

export const notify = {
  success(title, text = '') {
    return Toast.fire({
      icon: 'success',
      title,
      text,
      iconColor: '#059669'
    })
  },

  error(title, text = '') {
    return Toast.fire({
      icon: 'error',
      title,
      text,
      iconColor: '#dc2626'
    })
  },

  warning(title, text = '') {
    return Toast.fire({
      icon: 'warning',
      title,
      text,
      iconColor: '#d97706'
    })
  },

  info(title, text = '') {
    return Toast.fire({
      icon: 'info',
      title,
      text,
      iconColor: '#2563eb'
    })
  }
}

export const dialog = {
  success(title, text = '') {
    return Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'swal-popup-custom',
        confirmButton: 'swal-btn-custom'
      }
    })
  },

  error(title, text = '') {
    return Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'swal-popup-custom',
        confirmButton: 'swal-btn-custom'
      }
    })
  },

  confirm(title, text = '', confirmText = 'Ya', cancelText = 'Batal') {
    return Swal.fire({
      icon: 'question',
      title,
      text,
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true,
      customClass: {
        popup: 'swal-popup-custom',
        confirmButton: 'swal-btn-custom',
        cancelButton: 'swal-btn-cancel-custom'
      }
    })
  },

  loading(title = 'Memproses...') {
    Swal.fire({
      title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading()
      },
      customClass: {
        popup: 'swal-popup-custom'
      }
    })
  },

  close() {
    Swal.close()
  }
}

export default { notify, dialog }
