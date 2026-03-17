import Swal from 'sweetalert2';

export class Alerts {
  static success(message: string): void {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: message,
      confirmButtonText: 'OK',
      timer: 1800,
      timerProgressBar: true,
    });
  }

  static error(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonText: 'OK',
    });
  }
}
