import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, NumberValueAccessor, Validators } from '@angular/forms';
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
    this.cates=[];
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
           name:value.tensanpham,
           metaTitle:value.tensanpham.replace(/ /gi, "-"),
           categoryID:Number.parseInt(value.categoryID),
           description:value.mota,
           detail:value.chitiet,
           price:Number.parseFloat(value.gia),
           quantity:Number.parseInt(value.quantity),
           promotionPrice:Number.parseFloat(value.giakm),
           metaKeywords:value.tensanpham+','+'đồ án 5',
           metaDescriptions:value.mota.replace(/./gi, ",")
          };console.log(tmp);
        this._api.post('/api/product/create-item',tmp).takeUntil(this.unsubscribe).subscribe(res => {
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
           name:value.tensanpham,
           metaTitle:value.tensanpham.replace(/ /gi, "-"),
           categoryID:Number.parseInt(value.categoryID),
           description:value.mota,
           detail:value.chitiet,
           price:Number.parseFloat(value.gia),
           quantity:Number.parseInt(value.quantity),
           promotionPrice:Number.parseFloat(value.giakm),
           metaKeywords:value.tensanpham+','+'đồ án 5',
           metaDescriptions:value.tensanpham.mota(/./gi, ",")
          };

        this._api.post('/api/product/update-product',tmp).takeUntil(this.unsubscribe).subscribe(res => {
          alert('Cập nhật thành công');
          this.search();
          this.closeModal();
          });
      });
    }

  }

  onDelete(row) {
    this._api.post('/api/product/delete-product',{product_id:row.product_id}).takeUntil(this.unsubscribe).subscribe(res => {
      alert('Xóa thành công');
      this.search();
      });
  }

  Reset() {
    this.product = null;
    this.formdata = this.fb.group({
      'tensanpham': ['', Validators.required],
      'categoryID': ['', Validators.required],
      'mota': [''],
      'chitiet': [''],
      'quantity': [0, Validators.required],
      'gia': [0, Validators.required],
      'giakm': [0 ]
    }
);
  }

  createModal() {
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    this.isCreate = true;
    this.product = null;
    setTimeout(() => {
      $('#createproductModal').modal('toggle');
      this.formdata = this.fb.group({
        'tensanpham': ['', Validators.required],
        'categoryID': ['', Validators.required],
        'mota': [''],
        'chitiet': [''],
        'quantity': [0, Validators.required],
        'gia': [0, Validators.required],
        'giakm': [0 ]

      });

      this.doneSetupForm = true;
    });
  }

  public openUpdateModal(row) {
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    this.isCreate = false;
    setTimeout(() => {
      $('#createproductModal').modal('toggle');
      this._api.get('/api/product/get-by-id/'+ row.product_id).takeUntil(this.unsubscribe).subscribe((res:any) => {
        this.product = res;
        // let ngaysinh = new Date(this.product.ngaysinh);
          this.formdata = this.fb.group({
            'tensanpham': [this.product.name, Validators.required],
        'categoryID': [this.product, Validators.required],
        'mota': [this.product.description],
        'chitiet': [this.product.detail],
        'gia': [this.product.price, Validators.required],
        'quantity': [0, Validators.required],
        'giakm': [this.product.promotionPrice],
          });
          this.doneSetupForm = true;
        });
    }, 700);
  }

  closeModal() {
    $('#createproductModal').closest('.modal').modal('hide');
  }
}
