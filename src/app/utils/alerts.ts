import Swal from 'sweetalert2';

export class Alerts {
  static success(message: string): void {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: message,
      confirmButtonText: 'OK',
    });
  }
}
