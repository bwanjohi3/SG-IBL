export function prepareProductToEdit(allProductData) {
    let productParams = {
        productId: allProductData.productId,
        startDate: allProductData.startDate,
        endDate: allProductData.endDate,
        isActive: allProductData.isActive
    };
    let productAccountType = allProductData.productAccountType.map((type) => {
        return {
            accountTypeId: type.key,
            productId: allProductData.productId
        };
    });
    return {
        product: productParams,
        productAccountType: productAccountType,
        noResultSet: true
    };
};
