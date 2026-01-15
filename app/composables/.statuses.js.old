// composables/system.js

export const useStatuses = () => {
  const statuses = {
    'ANDRE-INA': { label: 'ANDRE-INA', selectable: true },
    'ANNULLATA': { label: 'ANNULLATA', selectable: true },
    'ANULLATA': { label: 'ANULLATA', selectable: true },
    'APERTA': { label: 'APERTA', selectable: true },
    'ARCHIVIO': { label: 'ARCHIVIO', selectable: true },
    'ARCHIVIO BLACK LIST': { label: 'ARCHIVIO BLACK LIST', selectable: true },
    'ARCHIVIO CAPI': { label: 'ARCHIVIO CAPI', selectable: true },
    'ARCHIVIO GR': { label: 'ARCHIVIO GR', selectable: true },
    'ARCHIVIO GR P.A.': { label: 'ARCHIVIO GR P.A.', selectable: true },
    'ARCHIVIO P.A.': { label: 'ARCHIVIO P.A.', selectable: true },
    'ARCHIVO': { label: 'ARCHIVO', selectable: true },
    'ATTESA NEWS': { label: 'ATTESA NEWS', selectable: true },
    'ATTESA RD': { label: 'ATTESA RD', selectable: true },
    'CAMION': { label: 'CAMION', selectable: true },
    'CANCELLATA RD': { label: 'CANCELLATA RD', selectable: true },
    'CASSA': { label: 'CASSA', selectable: true },
    'CHIARA': { label: 'CHIARA', selectable: true },
    'CHIUSA': { label: 'CHIUSA', selectable: true },
    'DA ANNULLARE': { label: 'DA ANNULLARE', selectable: true },
    'DISPUTA': { label: 'DISPUTA', selectable: true },
    'DISPUTA AX': { label: 'DISPUTA AX', selectable: true },
    'FOLDER HARTLAND': { label: 'FOLDER HARTLAND', selectable: true },
    'FOLDER IGOR': { label: 'FOLDER IGOR', selectable: true },
    'FOLDER LAGOS': { label: 'FOLDER LAGOS', selectable: true },
    'FOLDER LAMSAM': { label: 'FOLDER LAMSAM', selectable: true },
    'FOLDER MARWA': { label: 'FOLDER MARWA', selectable: true },
    'FOLDER NAKASATO': { label: 'FOLDER NAKASATO', selectable: true },
    'FOLDER RIO': { label: 'FOLDER RIO', selectable: true },
    'FOLDER ROSSO': { label: 'FOLDER ROSSO', selectable: true },
    'FOLDER SAMIR': { label: 'FOLDER SAMIR', selectable: true },
    'FOLDER SHANGHAI': { label: 'FOLDER SHANGHAI', selectable: true },
    'FOLDER TARIKO': { label: 'FOLDER TARIKO', selectable: true },
    'G & G': { label: 'G & G', selectable: true },
    'GIX': { label: 'GIX', selectable: true },
    'IMBALLO': { label: 'IMBALLO', selectable: true },
    'LEA': { label: 'LEA', selectable: true },
    'MONITORARE': { label: 'MONITORARE', selectable: true },
    'P.A.': { label: 'P.A.', selectable: true },
    'PROFORMA': { label: 'PROFORMA', selectable: true },
    'SPEDIRE': { label: 'SPEDIRE', selectable: true },
    'SPEDIRE DHL': { label: 'SPEDIRE DHL', selectable: true },
    'SPEDIRE EXP SHIP': { label: 'SPEDIRE EXP SHIP', selectable: true },
    'SPEDIRE UPS': { label: 'SPEDIRE UPS', selectable: true },
    'SPEDITO': { label: 'SPEDITO', selectable: true },
    'SPEDITOAR': { label: 'SPEDITOAR', selectable: true },
    'STORNO': { label: 'STORNO', selectable: true },
    'VI': { label: 'VI', selectable: true },
    'VIC': { label: 'VIC', selectable: true },
    'XY': { label: 'XY', selectable: true }
  }

  // Array solo degli stati selezionabili per le select
  const selectableStatuses = Object.entries(statuses)
    .filter(([key, value]) => value.selectable)
    .map(([key]) => key)
    .sort()

  // Array di tutti gli stati (anche non selezionabili)
  const allStatuses = Object.keys(statuses).sort()

  // Funzione per verificare se uno stato esiste
  const isStatus = (value) => {
    return statuses.hasOwnProperty(value)
  }

  // Funzione per verificare se uno stato è selezionabile
  const isSelectable = (value) => {
    return statuses[value]?.selectable === true
  }

  // Ottieni label di uno stato
  const getStatusLabel = (value) => {
    return statuses[value]?.label || value
  }

  return {
    statuses,
    selectableStatuses,
    allStatuses,                                   
    isStatus,
    isSelectable,
    getStatusLabel
  }
}