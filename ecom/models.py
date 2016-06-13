from django.db import models

import datetime

# Create your models here.

class Product(models.Model):
    
    ModelName = models.CharField(max_length=300)
    slug = models.SlugField(max_length=150)
    description = models.TextField()
    photo = models.ImageField(upload_to='product_photo',
    blank=True)
    manufacturer = models.CharField(max_length=300,
    blank=True)
    price_in_dollars = models.DecimalField(max_digits=6,
    decimal_places=2)
    Quantity = models.IntegerField(blank=True, null=True)
    Serial_No = models.DecimalField(max_digits=6,
    decimal_places=2,blank=True, null=True)
    
    def __unicode__(self):
        return self.ModelName
        
class Sale(models.Model):
    
    CustomerName = models.CharField(max_length=255)
    slug = models.SlugField(max_length=150)
    Address = models.TextField()
    pub_date = models.DateTimeField(default=datetime.datetime.now())
    Product_Sold = models.ForeignKey(Product)
    Sale_Quantity = models.IntegerField(default=0)
    
    def Gettotal(self):
        return (self.Sale_Quantity*self.Product_Sold.price_in_dollars)
    
    
    Total_Amount=property(Gettotal)
    
    
    def __unicode__(self):
        return self.CustomerName
    

        
        

        
#class CatalogCategory(models.Model):
#    
#    catalog = models.ForeignKey('Catlog',
#    related_name='categories')
#    parent = models.ForeignKey('self', blank=True, null=True,
#    related_name='children')
#    name = models.CharField(max_length=300)
#    slug = models.SlugField(max_length=150)
#    description = models.TextField(blank=True)
#    
#    def __unicode__(self):
#        return self.name
#        
#class ProductDetail(models.Model):
#
#    product = models.ForeignKey('Product',
#    related_name='details')
#    attribute = models.ForeignKey('ProductAttribute')
#    value = models.CharField(max_length=500)
#    description = models.TextField(blank=True)
#    
#    def __unicode__(self):
#        return u'%s: %s - %s' % (self.product,
#        self.attribute,
#        self.value)
#
#class ProductAttribute(models.Model):
#     
#    name = models.CharField(max_length=300)
#    description = models.TextField(blank=True)
#    
#    def __unicode__(self):
#        return u'%s' % self.name
#        