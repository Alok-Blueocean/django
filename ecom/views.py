from django.shortcuts import render,get_object_or_404,render_to_response
from .forms import ProductForm,SaleForm
from models import Product,Sale
from django.http import HttpResponseRedirect,HttpResponse,JsonResponse
from django.core.urlresolvers import reverse
from django.core import serializers
import json
# Create your views here.
#from forms import ProductForm

def Home(request):
    return render(request,"Home.html")
    
def ProductView(request):
    #products1=get_object_or_404(Product)
    products = Product.objects.all()

    form = ProductForm()
    return render(request,"ItemMaster.html",{"form":form,"products":products})      


   
def Addproduct(request):
    form=ProductForm(request.POST or None)
    if form.is_valid():
        ModelName = form.cleaned_data['ModelName']
        description = form.cleaned_data['description']
        photo = form.cleaned_data['photo']
        manufacturer = form.cleaned_data['manufacturer']
        price_in_dollars = form.cleaned_data['price_in_dollars']
        Quantity = form.cleaned_data['Quantity']
        Serial_No =form.cleaned_data['Serial_No']
        product=Product()
        product.ModelName=ModelName
        product.description=description
        product.photo=photo
        product.manufacturer=manufacturer
        product.price_in_dollars=price_in_dollars
        product.Quantity=Quantity
        product.Serial_No=Serial_No  
        product.save()
        return HttpResponseRedirect(reverse('ecom:product'))
        
        
        #return HttpResponseRedirect(reverse('ecom:product'))
    else:
        return render(request,"ItemMaster.html",{"form":form})    


def Editproduct(request):
    
    products = Product.objects.all()
    if request.method =="POST":
        filterdata = request.POST.get('searchdata')
        print(filterdata)
        fproducts = Product.objects.filter(ModelName__icontains=filterdata)
        return render(request,"ItemMasterEditProduct.html",{"products":fproducts})
    else:
        
        return render(request,"ItemMasterEditProduct.html",{"products":products})

def FilteredProduct(request):
    if request.method =="POST":
        filterdata = request.POST.get('searchdata')
        fproducts = Product.objects.filter(ModelName__icontains=filterdata)
        #render_to_string('ItemMaster.html',{"products":fproducts})
        result = []
        for prd in fproducts:
            result.append({"id":prd.id,"name":prd.ModelName})
        return JsonResponse(json.dumps(result))
        
    return render(request,"ItemMaster.html")
            
def EditProductByid(request,product_id):
    
    product = Product.objects.get(pk=product_id)
    
    if request.method =="POST":
        
        ModelName = request.POST.get('ModelName')
        
        product.ModelName = ModelName
        
        product.save()
        
        print()
        
        return  HttpResponseRedirect(reverse('ecom:editproduct'))
        
    else:
    
        return render(request,"EditProductForm.html",{"product":product})
    
def DeleteProductByid(request,product_id):
    
    product = Product.objects.get(pk=product_id)
    product.delete()
    return  HttpResponseRedirect(reverse('ecom:editproduct'))
    
def SaleView(request):
    
    sales = Sale.objects.all()
    form = SaleForm()
    return render(request,"SaleMaster.html",{"form":form,"sales":sales}) 
    
def AddSale(request):
    
    form = SaleForm(request.POST or None)  
    
    if form.is_valid():
        
        CustomerName = form.cleaned_data["CustomerName"]
        Address = form.cleaned_data["Address"]
        pub_date = form.cleaned_data["pub_date"]
        Sale_Quantity = form.cleaned_data["Sale_Quantity"]
        Product_Sold = form.cleaned_data["Product_Sold"]
        sale=Sale()  
        sale.CustomerName = CustomerName
        sale.Address = Address
        sale.pub_date = pub_date
        sale.Sale_Quantity = Sale_Quantity
        sale.Product_Sold = Product_Sold
        sale.save()
        
        product = Product.objects.filter(pk=sale.Product_Sold.id)[0]
        product.Quantity = product.Quantity - sale.Sale_Quantity
        product.save()
        
        return HttpResponseRedirect(reverse('ecom:sale'))
        
    else:
        return render(request,"SaleMaster.html",{"form":form})
        
def DeleteSaleByid(request,sale_id):
    
    sale = Sale.objects.get(pk=sale_id)
    sale.delete()
    return HttpResponseRedirect(reverse('ecom:sale'))
    
def ReportView(request):
    
    products = Product.objects.all()
    
    return render(request,"Reports.html",{"products":products})
    
def SalesReport(request):
    
    sales = Sale.objects.all()
    
    return render(request,"SaleReports.html",{"sales":sales})
    
    
    
    
        
        
    