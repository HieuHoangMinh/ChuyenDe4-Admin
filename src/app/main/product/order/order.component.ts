import { Component, Injector, OnInit } from '@angular/core';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import { Observable } from 'rxjs';
import {ToastModule} from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { BaseComponent } from 'src/app/lib/base-component';
declare var $: any;
declare var Swal: any;
declare var Toast: any;
declare var toastr: any;
@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent extends BaseComponent implements OnInit {
  location: Location;
  list_order: any;
  order_detail: any;
  status: any;
  term: string;
  p: number = 1;
  day: any;
  cols: any[];
  hidden = false;

   exportColumns: any[];
  constructor(injector: Injector) {
    super(injector);
   }

  ngOnInit(): void {
    this.status = [
      { id: 1, name: "Đang xử lý" },
      { id: 2, name: "Đã xác thực" },
      { id: 3, name: "Đã giao hàng" },
      { id: 0, name: "Đã hủy" },
    ];
    // Lay danh sach don hang
    this.day= Date.now();
    Observable.combineLatest(
      this._api.get('/api/order/get-all')).takeUntil(this.unsubscribe).subscribe(
        res => {
          this.list_order = res[0];
          console.log(this.list_order);
          setTimeout(() => {

          });
        }
    );




  }

  exportExcel() {
  //
    // import("xlsx").then(xlsx => {
    //   const worksheet = xlsx.utils.json_to_sheet(this.list_order);
    //   const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    //   const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
    //   this.saveAsExcelFile(excelBuffer, "list_order");
    // });
  }


  filterBill(id: any) {
      Observable.combineLatest(this._api.get("api/bill/get-by-status/" + id)).takeUntil(this.unsubscribe).subscribe(
      res => {
        this.list_order = res[0];
      }

   )

    console.log(this.list_order);
  }

 ViewDetail(id) {
    console.log(id);

     Observable.combineLatest(
      this._api.get('api/orderdetail/get-by-id/' + id)).takeUntil(this.unsubscribe).subscribe(
        res => {
          this.order_detail = res[0];
          console.log(this.order_detail);
          setTimeout(() => {
             $('#myBill').modal('toggle');

          });
        }
      );
  }

  deleteBill(id: any) {

   // $('#confirmModal').modal('toggle');

Swal.fire({
  title: 'Bạn chắc chắn chứ?',
  text: "Bạn không thẩy khôi phục lại đơn hàng!",
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Đúng, xóa ngay bây giờ!'
}).then((result) => {
  if (result.isConfirmed) {

     Observable.combineLatest(
      this._api.get('api/bill/delete-bill/' + id)).takeUntil(this.unsubscribe).subscribe(
        res => {
         // location.reload();
          this.list_order = this.list_order.filter(val => val.id != id);
        }
      );

    Swal.fire(
      'Đã xóa!',
      'Đơn hàng đã bị xóa!.',
      'success'
    );
  }
})




   }
  changeStatus(id: any, msg: any) {
    console.log(msg);
     Observable.combineLatest(
      this._api.get('api/bill/change-status/' + id + '/' +msg)).takeUntil(this.unsubscribe).subscribe(
        res => {
          $(document).Toasts('create', {
            class: 'bg-light',
            icon:'',
            title: 'Thành công!',
            subtitle: '',
           //delay: 10,
            fixed: false,
            body: 'Thay đổi trạng thái đơn hàng thành công!'
          });

            location.reload();



        }
      );
  }



}
