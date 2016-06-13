from django.conf.urls import include, url
from django.contrib import admin
from . import views
urlpatterns = [
    # Examples:
    # url(r'^$', 'ecommerce.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^$', views.Home),
    url(r'^product/$', views.ProductView,name="product"),
    url(r'^addproduct/$', views.Addproduct,name="addproduct"),
    url(r'^editproduct/$', views.Editproduct,name="editproduct"),
    url(r'^search/$', views.FilteredProduct,name="filteredproduct"),
    url(r'^editproductbyid/(?P<product_id>[0-9]+)/$', views.EditProductByid,name="editproductbyid"),
    url(r'^deleteproductbyid/(?P<product_id>[0-9]+)/$', views.DeleteProductByid,name="deleteproductbyid"),
    url(r'^sale/$', views.SaleView,name="sale"),
    url(r'^addsale/$', views.AddSale,name="addsale"),
    url(r'^deletesalebyid/(?P<sale_id>[0-9]+)/$', views.DeleteSaleByid,name="deletesalebyid"),
    url(r'^reports/$', views.ReportView,name="reports"),
    url(r'^salesreport/$', views.SalesReport,name="salesreport"),
#    url(r'^product', views.SalesView),
#    url(r'^product', views.DailyExpenseView),
#    url(r'^product', views.ReportsView),
#    url(r'^product', views.LoginView),

]
