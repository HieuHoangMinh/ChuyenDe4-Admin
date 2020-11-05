import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FileUpload } from 'primeng/fileupload';
import { MustMatch } from 'src/app/helpers/must-match.validator';
import { BaseComponent } from 'src/app/lib/base-component';
import 'rxjs/add/operator/takeUntil';
declare var $: any;
@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent extends BaseComponent implements OnInit {
response:any;
  public products: any;
  public product: any;
  public totalRecords:any;
  public pageSize = 3;
  public page = 1;
  public uploadedFiles: any[] = [];
  public formsearch: any;
  public formdata: any;
  public doneSetupForm: any;
  public showUpdateModal:any;
  public isCreate:any;

  public name:any;
  public categoryid:any;
  cates:any;
  submitted = false;
  @ViewChild(FileUpload, { static: false }) file_image: FileUpload;
  constructor(private fb: FormBuilder, injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.response=[];
    this.name=null;this.categoryid=0;
    this.formsearch = this.fb.group({
      'Name': [''],
      'categoryID': [''],
    });

   this.search();
   this.getallloai();
  }

  loadPage(page) {
    if(this.formsearch.get('Name').value==null ||this.formsearch.get('Name').value=='') this.name='%20'; //%20= khoang trang
    else this.name=this.formsearch.get('Name').value;
    if(this.formsearch.get('categoryID').value==null ||this.formsearch.get('categoryID').value==0 )this.categoryid=0;//neu maloai=0 thi lay tat ca sp
    this._api.get('/api/product/search/'+page+'/'+this.pageSize+'/'+this.name+'/'+this.categoryid).takeUntil(this.unsubscribe).subscribe(res => {
      this.response = res;
      this.products=this.response.data;
      this.totalRecords =  this.response.totalItems;
      this.pageSize = this.response.pageSize;
      });
  }

  search() {

    if(this.formsearch.get('Name').value==null ||this.formsearch.get('Name').value=='') this.name='%20'; //%20= khoang trang
    else this.name=this.formsearch.get('Name').value;
    if(this.formsearch.get('categoryID').value==null ||this.formsearch.get('categoryID').value==0 )this.categoryid=0;//neu maloai=0 thi lay tat ca sp
    else this.categoryid=(this.formsearch.get('categoryID').value);
    this.page = 1;
    this.pageSize = 12;
    this._api.get('/api/product/search/'+this.page+'/'+this.pageSize+'/'+this.name+'/'+this.categoryid).takeUntil(this.unsubscribe).subscribe(res => {
      this.response = res;
      this.products=this.response.data;
      this.totalRecords =  this.response.totalItems;
      this.pageSize = this.response.pageSize;

      });
  }
  getallloai(){
    this.cates=[]
    this._api.get('/api/ProductCategory/get-all').takeUntil(this.unsubscribe).subscribe(res=>{
this.cates=res;
    });
  }

  pwdCheckValidator(control){
    var filteredStrings = {search:control.value, select:'@#!$%&*'}
    var result = (filteredStrings.select.match(new RegExp('[' + filteredStrings.search + ']', 'g')) || []).join('');
    if(control.value.length < 6 || !result){
        return {matkhau: true};
    }
  }

  get f() { return this.formdata.controls; }

  onSubmit(value) {
    this.submitted = true;
    if (this.formdata.invalid) {
      return;
    }
    if(this.isCreate) {
      this.getEncodeFromImage(this.file_image).subscribe((data: any): void => {
        let data_image = data == '' ? null : data;
        let tmp = {
           image_url:data_image,
           hoten:value.hoten,
           diachi:value.diachi,
           gioitinh:value.gioitinh,
           email:value.email,
           taikhoan:value.taikhoan,
           matkhau:value.matkhau,
           role:value.role,
           ngaysinh:value.ngaysinh
          };
        this._api.post('/api/products/create-product',tmp).takeUntil(this.unsubscribe).subscribe(res => {
          alert('Thêm thành công');
          this.search();
          this.closeModal();
          });
      });
    } else {
      this.getEncodeFromImage(this.file_image).subscribe((data: any): void => {
        let data_image = data == '' ? null : data;
        let tmp = {
           image_url:data_image,
           hoten:value.hoten,
           diachi:value.diachi,
           gioitinh:value.gioitinh,
           email:value.email,
           taikhoan:value.taikhoan,
           matkhau:value.matkhau,
           role:value.role,
           ngaysinh:value.ngaysinh ,
           product_id:this.product.product_id,
          };
        this._api.post('/api/products/update-product',tmp).takeUntil(this.unsubscribe).subscribe(res => {
          alert('Cập nhật thành công');
          this.search();
          this.closeModal();
          });
      });
    }

  }

  onDelete(row) {
    this._api.post('/api/products/delete-product',{product_id:row.product_id}).takeUntil(this.unsubscribe).subscribe(res => {
      alert('Xóa thành công');
      this.search();
      });
  }

  Reset() {
    this.product = null;
    this.formdata = this.fb.group({
      'hoten': ['', Validators.required],
      'ngaysinh': [this.today, Validators.required],
      'diachi': [''],
      'gioitinh': [this.genders[0].value, Validators.required],
      'email': ['', [Validators.required,Validators.email]],
      'taikhoan': ['', Validators.required],
      'matkhau': ['', [this.pwdCheckValidator]],
      'nhaplaimatkhau': ['', Validators.required],
      'role': [this.roles[0].value, Validators.required],
    }, {
      validator: MustMatch('matkhau', 'nhaplaimatkhau')
    });
  }

  createModal() {
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    this.isCreate = true;
    this.product = null;
    setTimeout(() => {
      $('#createproductModal').modal('toggle');
      this.formdata = this.fb.group({
        'hoten': ['', Validators.required],
        'ngaysinh': ['', Validators.required],
        'diachi': [''],
        'gioitinh': ['', Validators.required],
        'email': ['', [Validators.required,Validators.email]],
        'taikhoan': ['', Validators.required],
        'matkhau': ['', [this.pwdCheckValidator]],
        'nhaplaimatkhau': ['', Validators.required],
        'role': ['', Validators.required],
      }, {
        validator: MustMatch('matkhau', 'nhaplaimatkhau')
      });
      this.formdata.get('ngaysinh').setValue(this.today);
      this.formdata.get('gioitinh').setValue(this.genders[0].value);
      this.formdata.get('role').setValue(this.roles[0].value);
      this.doneSetupForm = true;
    });
  }

  public openUpdateModal(row) {
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    this.isCreate = false;
    setTimeout(() => {
      $('#createproductModal').modal('toggle');
      this._api.get('/api/products/get-by-id/'+ row.product_id).takeUntil(this.unsubscribe).subscribe((res:any) => {
        this.product = res;
        let ngaysinh = new Date(this.product.ngaysinh);
          this.formdata = this.fb.group({
            'hoten': [this.product.hoten, Validators.required],
            'ngaysinh': [ngaysinh, Validators.required],
            'diachi': [this.product.diachi],
            'gioitinh': [this.product.gioitinh, Validators.required],
            'email': [this.product.email, [Validators.required,Validators.email]],
            'taikhoan': [this.product.taikhoan, Validators.required],
            'matkhau': [this.product.matkhau, [this.pwdCheckValidator]],
            'nhaplaimatkhau': [this.product.matkhau, Validators.required],
            'role': [this.product.role, Validators.required],
          }, {
            validator: MustMatch('matkhau', 'nhaplaimatkhau')
          });
          this.doneSetupForm = true;
        });
    }, 700);
  }

  closeModal() {
    $('#createproductModal').closest('.modal').modal('hide');
  }
}
