import {fromJS} from 'immutable';
import {actionList} from './actions';
import {utCardStatusAction} from './pages/Main/reducer';

import {cardFilterByCardProduct} from './components/Filters/ByProduct/reducer';
import {cardsFilterByBusinessUnitSelect} from './components/Filters/ByBusinessUnitSelect/reducer';

import {cardApplicationsGrid} from './containers/Applications/Grid/reducer';
import {cardApplicationsPagination} from './containers/Applications/Pagination/reducer';
import {cardApplicationsGridOrder} from './containers/Applications/Order/reducer';
import {cardApplicationsFilterByBusinessUnitSelection} from './containers/Applications/Filters/ByBusinessUnit/reducer';
import {cardApplicationsFilterByCardType} from './containers/Applications/Filters/ByCardType/reducer';
import {cardApplicationsFilterByProduct} from './containers/Applications/Filters/ByProduct/reducer';
import {cardApplicationsFilterByIssuingBusinessUnit} from './containers/Applications/Filters/ByIssuingBusinessUnit/reducer';
import {cardApplicationsFilterByStatus} from './containers/Applications/Filters/ByStatus/reducer';
import {cardApplicationsFilterByCustomSearch} from './containers/Applications/Filters/ByCustomSearch/reducer';
import {cardApplicationsFilterClear} from './containers/Applications/Filters/Clear/reducer';
import {cardApplicationsToolbox} from './containers/Applications/GridToolbox/reducer';
import {cardNameApplicationAccounts} from './containers/Applications/NameApplicationCreate/AccountsGrid/reducer';
import {cardNameApplicationUploads} from './containers/Applications/NameApplicationCreate/Uploads/reducer';
import {cardNoNameApplicationAccounts} from './containers/Applications/NoNameApplicationCreate/AccountsGrid/reducer';
import {cardNoNameApplicationCreate} from './containers/Applications/NoNameApplicationCreate/reducer';
import {cardNoNameApplicationUploads} from './containers/Applications/NoNameApplicationCreate/Uploads/reducer';
import {cardNameApplicationCreate} from './containers/Applications/NameApplicationCreate/reducer';
import {cardApplicationDetails} from './containers//Applications/Popups/Details/reducer';
import {cardApplicationDetailsUploads} from './containers//Applications/Popups/Details/Uploads/reducer';
import {cardApplicationDetailsAccounts} from './containers//Applications/Popups/Details/AccountsGrid/reducer';
import {cardApplicationCreateBatch} from './containers/Applications/Popups/CreateBatch/reducer';
import {cardApplicationAddToExistingBatch} from './containers/Applications/Popups/AddToExistingBatch/reducer';
import {cardApplicationActionWithReason} from './containers/Applications/Popups/ActionWithReason/reducer';
import {cardApplicationConfirmActionPopup} from './containers/Applications/Popups/ConfirmAction/reducer';

import {cardManagementGrid, cardInProductionGridColumnVisibility} from './containers/Cards/Grid/reducer';
import {cardManagementGridToolbox} from './containers/Cards/GridToolbox/reducer';
import {cardManagementFiltersWrapper} from './containers/Cards/FiltersWrapper/reducer';
import {cardManagementFilterByPage} from './containers/Cards/Filters/ByPage/reducer';
import {cardManagementFilterByStatus} from './containers/Cards/Filters/ByStatus/reducer';
import {cardManagementFilterByCustomSearch} from './containers/Cards/Filters/ByCustomSearch/reducer';
import {cardManagementFilterByBusinessUnitSelection} from './containers/Cards/Filters/ByBusinessUnit/reducer';
import {cardManagementFilterByTargetBusinessUnit} from './containers/Cards/Filters/ByTargetBusinessUnit/reducer';
import {cardManagementFilterByIssuingBusinessUnit} from './containers/Cards/Filters/ByIssuingBusinessUnit/reducer';
import {cardManagementFilterByCardProduct} from './containers/Cards/Filters/ByCardProduct/reducer';
import {cardManagementFilterClear} from './containers/Cards/Filters/Clear/reducer';
import {cardsGridOrder} from './containers/Cards/Filters/Order/reducer';
import {cardDetailsPopup} from './containers/Cards/ActionDialogScreens/Details/reducer';
import {cardConfirmActionPopup} from './containers/Cards/ActionDialogScreens/ConfirmAction/reducer';
import {cardActionWithReason} from './containers/Cards/ActionDialogScreens/ActionWithReason/reducer';
import {cardRelocationPopup} from './containers/Cards/ActionDialogScreens/Relocate/reducer';
import {cardActionDialogScreens} from './containers/Cards/ActionDialogScreens/reducer';
import {cardManagementActionButtons} from './containers/Cards/ActionButtons/reducer';
import {cardManagementDocument} from './containers/Cards/ActionDialogScreens/Details/Documents/reducer';

import {cardInUseGrid, cardInUseGridColumnVisibility} from './containers/CardInUse/Grid/reducer';
import {cardInUseFilterByStatus} from './containers/CardInUse/Filters/ByStatus/reducer';
import {cardInUseFilterByType} from './containers/CardInUse/Filters/ByType/reducer';
import {cardInUseFilterByCardProduct} from './containers/CardInUse/Filters/ByProduct/reducer';
import {cardInUseFilterByIssuingBusinessUnit} from './containers/CardInUse/Filters/ByIssuingBusinessUnit/reducer';
import {cardInUseFilterByCustomSearch} from './containers/CardInUse/Filters/ByCustomSearch/reducer';
import {cardInUseFilterClear} from './containers/CardInUse/Filters/Clear/reducer';
import {cardInUsePagination} from './containers/CardInUse/Pagination/reducer';
import {distributedGridOrder} from './containers/CardInUse/Order/reducer';
import {cardInUseFilterByBUSelection} from './containers/CardInUse/Filters/ByBusinessUnit/reducer';
import {cardInUseToolbox} from './containers/CardInUse/GridToolbox/reducer';
import {cardInUseAccount} from './containers/CardInUse/Details/AccountList/reducer';
import {cardInUseDetails} from './containers/CardInUse/Details/reducer';
import {cardInUse} from './containers/CardInUse/Card/reducer';
import {cardsInUseActionButtons} from './containers/CardInUse/ActionButtons/reducer';
import {cardInUseActionDialogScreens} from './containers/CardInUse/ActionDialogScreens/reducer';
import {cardInUseConfirmActionPopup} from './containers/CardInUse/ActionDialogScreens/ConfirmAction/reducer';
import {cardInUseActionWithReason} from './containers/CardInUse/ActionDialogScreens/ActionWithReason/reducer';
import {cardInUseUpdatePopup} from './containers/CardInUse/ActionDialogScreens/Update/reducer';
import {cardInUseDocument} from './containers/CardInUse/Details/Documents/reducer';

import {batchesToolboxToolbox} from './containers/Batches/GridToolbox/reducer';
import {batchesActionButtons} from './containers/Batches/Buttons/reducer';
import {batchesFilterByProduct} from './containers/Batches/Filters/ByProduct/reducer';
import {batchesFilterByStatus} from './containers/Batches/Filters/ByStatus/reducer';
import {batchesFilterByTargetUnit} from './containers/Batches/Filters/ByTargetBusinessUnit/reducer';
import {batchesFilterByIssuingUnit} from './containers/Batches/Filters/ByIssuingBusinessUnit/reducer';
import {batchesFilterByBatchName} from './containers/Batches/Filters/ByBatchName/reducer';
import {batchesGrid, batchesGridColumnVisibility} from './containers/Batches/Grid/reducer';
import {batchesPagination} from './containers/Batches/Pagination/reducer';
import {batchDetails} from './containers/Batches/Details/reducer';
import {rejectDetails} from './containers/Batches/Reject/reducer';
import {noNameBatch} from './containers/Batches/NoNameBatch/reducer';
import {batchGridOrder} from './containers/Batches/Grid/Order/reducer';
import {batchStatusUpdatePopup} from './containers/Batches/Details/BatchStatusUpdate/reducer';
import {cardBatchesFilterClear} from './containers/Batches/Filters/Clear/reducer';
import {batchDownloadInfo} from './containers/Batches/BatchDownloadInfo/reducer';

import {cardProductGrid, cardProductGridColumnVisibility} from './containers/CardProduct/Grid/reducer';
import {createCardProduct} from './containers/CardProduct/Details/Create/reducer';
import {cardProductToolbox} from './containers/CardProduct/GridToolbox/reducer';
import {editCardProduct} from '../react/containers/CardProduct/Details/Edit/reducer';
import {cardProductNameFilter} from './containers/CardProduct/Filters/ByName/reducer';
import {cardProductOrderFilter} from './containers/CardProduct/Filters/ByOrder/reducer';
import {cardProductStatusFilter} from './containers/CardProduct/Filters/ByStatus/reducer';
import {cardProductFilterClear} from './containers/CardProduct/Filters/Clear/reducer';
import {cardProductManagementFilterByBusinessUnitSelection} from './containers/CardProduct/Filters/ByBusinessUnit/reducer';

import {cardTypeGrid, cardTypeGridColumnVisibility} from './containers/CardType/Grid/reducer';
import {createCardType} from './containers/CardType/Details/reducer';
import {cardTypeToolbox} from './containers/CardType/GridToolbox/reducer';
// import {editCardType} from '../react/containers/CardType/Details/Edit/reducer';
import {cardTypeNameFilter} from './containers/CardType/Filters/ByName/reducer';
import {cardTypeOrderFilter} from './containers/CardType/Filters/ByOrder/reducer';
import {cardTypeStatusFilter} from './containers/CardType/Filters/ByStatus/reducer';
import {cardTypeFilterClear} from './containers/CardType/Filters/Clear/reducer';
import {cardTypeBusinessUnitFilter} from './containers/CardType/Filters/ByBusinessUnit/reducer';

import {cardReasonGrid, cardReasonGridColumnVisibility} from './containers/CardReason/Grid/reducer';
import {cardReasonGridToolbox} from './containers/CardReason/GridToolbox/reducer';
import {cardReasonGridOrder} from './containers/CardReason/Filters/ByOrder/reducer';
import {cardReasonFilterByModule} from './containers/CardReason/Filters/ByModule/reducer';
import {cardReasonFilterByAction} from './containers/CardReason/Filters/ByAction/reducer';
import {cardReasonFilterByStatus} from './containers/CardReason/Filters/ByStatus/reducer';
import {cardReasonFilterByReasonName} from './containers/CardReason/Filters/ByReasonName/reducer';
import {cardReasonFilterByPage} from './containers/CardReason/Filters/ByPage/reducer';
import {cardReasonFilterClear} from './containers/CardReason/Filters/Clear/reducer';
import {cardReasonDialogScreens} from './containers/CardReason/DialogScreens/reducer';
import {cardReasonCreateDialog} from './containers/CardReason/DialogScreens/Create/reducer';
import {cardReasonEditDialog} from './containers/CardReason/DialogScreens/Edit/reducer';
import {cardReasonDeleteDialog} from './containers/CardReason/DialogScreens/Delete/reducer';
import {cardReasonStatusUpdateDialog} from './containers/CardReason/DialogScreens/StatusUpdate/reducer';

// bins
import {cardBinsToolbox} from './containers/CardBin/GridToolbox/reducer';
import {cardBinsGrid} from './containers/CardBin/Grid/reducer';
import {cardBinsGridOrder} from './containers/CardBin/Order/reducer';
import {cardBinsPagination} from './containers/CardBin/Pagination/reducer';
import {cardBinsFilterByStatus} from './containers/CardBin/Filters/ByStatus/reducer';
import {cardBinsFilterClear} from './containers/CardBin/Filters/Clear/reducer';
import {cardBinCreate} from './containers/CardBin/Popups/Create/reducer';
import {cardBinDetails} from './containers/CardBin/Popups/Details/reducer';

// PIN mailer format
import {pinMailerGrid} from './containers/PINMailerFormat/PINMailerGrid/reducer';

import {pinMailerFileGrid, pinMailerFileGridColumnVisibility} from './pages/PinMailerFile/reducer';
import {pinMailerFileDetails} from './containers/PinMailerFile/Details/reducer';

const defaultStateConfig = fromJS({
    usedCardTypes: 'both', // card types that the company uses. Valid values: 'noName', 'name', 'both'
    application: {
        grid: {
            fields: [],
            orderByFields: []
        },
        filters: {
            filterByCustomSearch: {
                fields: [],
                defaultField: ''
            }
        },
        details: {
            fields: ['productName', 'customerName', 'cardNumber', 'customerType', 'personName', 'holderName', 'customerNumber', 'issuingBranchName', 'applicationId', 'targetBranchName', 'batchName', 'createdOn', 'makerComments']
        },
        accounts: {
            available: {
                fields: ['accountTypeName', 'currency', 'accountNumber', 'methodOfOperationId'],
                customStyles: {
                    currency: {width: 'auto'}
                }
            },
            linked: {
                fields: ['accountTypeName', 'currency', 'accountNumber', 'methodOfOperationId'],
                customStyles: {
                    currency: {width: 'auto'}
                }
            }
        },
        createName: {
            hidePerson: false
        }
    },
    batches: {
        autoGenerateBatchName: false,
        statusFlow: [],
        // how the cards' currentBranchId will be set when completing batch.
        // Valid values: null ('branchId' = default !!!; dropdown hidden), 'branchId', 'targetBranchId', 'issuingBranchId'
        cardsAutoAllocation: 'branchId',
        grid: {
            fields: [],
            orderByFields: []
        },
        details: {
            fields: ['batchType', 'batchName', 'numberOfCards', 'typeName', 'targetBranchName', 'issuingBranchName', 'cardsAutoAllocationBusinessUnit']
        }
    },
    cardsInUse: {
        grid: {
            fields: [],
            orderByFields: []
        },
        filters: {
            filterByCustomSearch: {
                fields: [],
                defaultField: ''
            }
        },
        details: {
            fields: ['customerName', 'personName', 'customerNumber', 'customerType', 'cardholderName', 'cardNumber', 'activationDate', 'expirationDate', 'creationBranchName', 'batchName']
        },
        accounts: {
            available: {
                fields: ['accountTypeName', 'currency', 'accountNumber', 'methodOfOperationId'],
                customStyles: {
                    currency: {width: 'auto'}
                }
            },
            linked: {
                fields: ['accountTypeName', 'currency', 'accountNumber', 'methodOfOperationId'],
                customStyles: {
                    currency: {width: 'auto'}
                }
            }
        }
    },
    cards: {
        grid: {
            fields: [],
            orderByFields: []
        },
        filters: {
            filterByCustomSearch: {
                fields: [],
                defaultField: ''
            }
        },
        details: {
            fields: ['customerName', 'personName', 'customerNumber', 'customerType', 'cardProduct', 'cardNumber', 'cardholderName', 'creationBranchName', 'targetBranchName', 'expirationDate', 'updatedOn', 'batchName']
        }
    },
    cardProducts: {
        periodicCardFeeOptional: false,
        grid: {
            fields: [],
            orderByFields: []
        }
    },
    cardTypes: {
        cvvSelectionRequired: false,
        grid: {
            fields: [],
            orderByFields: []
        }
    },
    cardReasons: {
        grid: {
            fields: [],
            orderByFields: []
        }
    },
    cardBins: {
        grid: {
            fields: [],
            orderByFields: []
        },
        filters: {}
    },
    pinMailerFile: {
        cvvSelectionRequired: false,
        grid: {
            fields: [],
            orderByFields: []
        }
    },
});

export default {
    cardFilterByCardProduct,
    cardsFilterByBusinessUnitSelect,

    utCardStatusAction,

    cardApplicationsGrid,
    cardApplicationsPagination,
    cardApplicationsGridOrder,
    cardApplicationsFilterByBusinessUnitSelection,
    cardApplicationsFilterByCardType,
    cardApplicationsFilterByProduct,
    cardApplicationsFilterByIssuingBusinessUnit,
    cardApplicationsFilterByStatus,
    cardApplicationsFilterByCustomSearch,
    cardApplicationsFilterClear,
    cardApplicationsToolbox,
    cardNameApplicationAccounts,
    cardNameApplicationUploads,
    cardNoNameApplicationAccounts,
    cardNoNameApplicationCreate,
    cardNoNameApplicationUploads,
    cardNameApplicationCreate,
    cardApplicationDetails,
    cardApplicationDetailsUploads,
    cardApplicationDetailsAccounts,
    cardApplicationCreateBatch,
    cardApplicationAddToExistingBatch,
    cardApplicationActionWithReason,
    cardApplicationConfirmActionPopup,

    cardManagementGrid,
    cardInProductionGridColumnVisibility,
    cardManagementGridToolbox,
    cardManagementFiltersWrapper,
    cardManagementFilterByPage,
    cardManagementFilterByStatus,
    cardManagementFilterByCustomSearch,
    cardManagementFilterByBusinessUnitSelection,
    cardManagementFilterByTargetBusinessUnit,
    cardManagementFilterByIssuingBusinessUnit,
    cardManagementFilterByCardProduct,
    cardManagementFilterClear,
    cardsGridOrder,
    cardDetailsPopup,
    cardRelocationPopup,
    cardConfirmActionPopup,
    cardActionWithReason,
    cardActionDialogScreens,
    cardManagementActionButtons,
    cardManagementDocument,

    cardInUseGrid,
    cardInUseGridColumnVisibility,
    cardInUseFilterByStatus,
    cardInUseFilterByType,
    cardInUseFilterByCardProduct,
    cardInUseFilterByIssuingBusinessUnit,
    cardInUseFilterByCustomSearch,
    cardInUseFilterByBUSelection,
    cardInUseFilterClear,
    distributedGridOrder,
    cardInUsePagination,
    cardInUseAccount,
    cardInUseDetails,
    cardInUseToolbox,
    cardInUse,
    cardsInUseActionButtons,
    cardInUseActionDialogScreens,
    cardInUseActionWithReason,
    cardInUseConfirmActionPopup,
    cardInUseUpdatePopup,
    cardInUseDocument,

    batchesToolboxToolbox,
    batchesActionButtons,
    batchesFilterByProduct,
    batchesFilterByStatus,
    batchesFilterByIssuingUnit,
    batchesFilterByTargetUnit,
    batchesFilterByBatchName,
    batchesGrid,
    batchesPagination,
    batchDetails,
    rejectDetails,
    noNameBatch,
    batchGridOrder,
    cardBatchesFilterClear,
    batchDownloadInfo,
    batchStatusUpdatePopup,
    batchesGridColumnVisibility,

    editCardProduct,
    createCardProduct,
    cardProductGrid,
    cardProductGridColumnVisibility,
    cardProductOrderFilter,
    cardProductStatusFilter,
    cardProductFilterClear,
    cardProductToolbox,
    cardProductNameFilter,
    cardProductManagementFilterByBusinessUnitSelection,

    // editCardType,
    createCardType,
    cardTypeGrid,
    cardTypeGridColumnVisibility,
    cardTypeOrderFilter,
    cardTypeStatusFilter,
    cardTypeFilterClear,
    cardTypeToolbox,
    cardTypeNameFilter,
    cardTypeBusinessUnitFilter,

    cardReasonGrid,
    cardReasonGridToolbox,
    cardReasonGridOrder,
    cardReasonFilterByModule,
    cardReasonFilterByAction,
    cardReasonFilterByStatus,
    cardReasonFilterByReasonName,
    cardReasonFilterByPage,
    cardReasonFilterClear,
    cardReasonDialogScreens,
    cardReasonCreateDialog,
    cardReasonEditDialog,
    cardReasonDeleteDialog,
    cardReasonStatusUpdateDialog,
    cardReasonGridColumnVisibility,

    cardBinsToolbox,
    cardBinsGrid,
    cardBinsGridOrder,
    cardBinsPagination,
    cardBinsFilterByStatus,
    cardBinsFilterClear,
    cardBinCreate,
    cardBinDetails,
    pinMailerGrid,

    pinMailerFileGrid,
    pinMailerFileGridColumnVisibility,
    pinMailerFileDetails,

    cardConfig: (state = defaultStateConfig, action) => {
        if (actionList.SET_CONFIG === action.type) {
            return state.mergeDeep(fromJS(action.config));
        }
        return state;
    }
};
