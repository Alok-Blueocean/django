from django.forms import ModelForm, Textarea
from ecom.models import Product,Sale

class ProductForm(ModelForm):
    class Meta:
        model = Product
        fields = ['ModelName','description','photo','manufacturer','price_in_dollars','Quantity','Serial_No']
        
class SaleForm(ModelForm):
    class Meta:
        model = Sale
        fields = ['CustomerName','Address','pub_date','Product_Sold','Sale_Quantity']
    #Product_Sold = ModelForm.