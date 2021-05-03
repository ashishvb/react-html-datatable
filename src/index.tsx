import React from 'react'
import './styles.scss'

interface DataTableProps<T>{
    columns: Array<keyof T | ((arg0: T) => JSX.Element)>
    data: Array<T>,
    title: Array<String>,
    sortField?: keyof T,
    sortOrder?: 'asc' | 'desc',
}

export default function DataTable<T>({data, columns, title, sortField, sortOrder}: DataTableProps<T>) {
    
    let [perPage, setPerPage] = React.useState(10);
    let [searchQuery, setSearchQuery] = React.useState('');
    let [page, setPage] = React.useState(1);
    let [sorting] = React.useState(true)
    let [sField, setSField] = React.useState(sortField)
    let [sOrder, setSOrder] = React.useState(sortOrder || 'desc')
    let [filteredData, setFilteredData]  = React.useState(data);

    React.useEffect(() => { 
    
        let fData = searchQuery.trim() !== '' ? searchData() : data;

        if(sorting){
            fData = fData.sort(sortData)
        }

        setFilteredData([...fData]);
    }, [sField, searchQuery, sOrder])

    // EVENTS
    const changeSortField = (col: keyof T | ((arg0: T) => JSX.Element)) => {
        if(typeof col === "string" || typeof col === "number" || typeof col === "boolean" || typeof col === 'bigint' ){
           
            if(col === sField) {
                setSOrder(sOrder === 'asc' ? 'desc' : 'asc');
                return;
            }
            setSField(col);
            setSOrder("asc");
        }
    }

    // LOGIC
    const calculateStartAndEndPos  = () => {

        let startPos = perPage * (page - 1);

        if(startPos < 0) startPos = 0;

        let endPos =  (perPage * (page)) - 1;

        if(endPos > data.length) endPos = data.length

        return [startPos, endPos]
    }

    const sortData = (a:T, b:T) => {
        if(sField && sField != undefined){            
            switch (typeof  a[sField]) {
                case 'number':
                    return  (sOrder === 'desc') ?  
                            (b[sField] as unknown as number) - (a[sField] as unknown as number) :
                            (a[sField] as unknown as number) - (b[sField] as unknown as number)

                case 'string':
                    return  (sOrder ==='asc') ?  
                            ((b[sField] as unknown as string).toLowerCase() > (a[sField] as unknown as string).toLowerCase() ? -1 : 1) 
                            :
                            ((a[sField] as unknown as string).toLowerCase() > (b[sField] as unknown as string).toLowerCase() ? -1 : 1) 
            }
            
        } 

        return 1;
    }

    const searchData = () => {
        return data.filter(d => {

            for (const c of columns) {
                if(typeof c !== "function"){
                    let str = String(d[c]);
                    if(str.toLowerCase().includes(searchQuery.toLowerCase())) {
                        return true;
                        break;
                    }
                }
            }
            
            return false;
        })
    }


    // RENDER
    const renderRows = () => {
    
        let [startPos, endPos] = calculateStartAndEndPos();
        
        return  <tbody>
            {
                filteredData.map((d, i) => {

                    if(i < startPos || i > endPos) return null;
    
                    return <tr key={i}>
                            {   
                                columns.map((c, j) => {
                                return   <td key={j}>
                                        {typeof c === "string" ? d[c] : '' }
                                        {typeof c === "function" ? c(d) : ''}
                                    </td>
                                })
                            }
                         </tr>
                 })
            }
            
            {filteredData.length === 0 ? <td colSpan={columns.length} style={{textAlign: 'center'}}>
                                No data found
                            </td> : null  }
        </tbody>
    }

    const renderFooter = () => {
            
            let [startPos] = calculateStartAndEndPos();
            let pageCount = Math.ceil(data.length/perPage);


            if(pageCount <= 0) return '';

            return <div className="dt__footer">
            <div className="dt__footer-position">
                Showing { startPos + 1} to {data.length} of {data.length} entries
            </div>
            <div className="dt__footer-pagination">
                <button onClick={() =>setPage(page - 1)} disabled={ page !== 1 ?  true : false }> Prev</button>
                {
                    [...Array(pageCount)].map((p, i) =>   <button className={page === i + 1 ? 'active' : ''} key={i} onClick={() =>setPage(i + 1)}> { i + 1 }</button>)
                }
                <button onClick={() =>setPage(page + 1)}  disabled={ page !== pageCount ? true : false }> Next</button>
            </div>
        </div>
    }

    return (
        <div className="dt__wrapper">
            <div className="dt__header">
                <div className="dt__header-perpage">
                    Show
                    <select value={perPage} onChange={e => setPerPage((e.target.value as unknown as number))}>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    Entries
                </div>


                <div className="dt__header-search">
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}  placeholder="Search..." />
                </div>
            </div>

            <div className="dt__responsive">
                <table className="dt__table">
                    <thead>
                        <tr>
                            {
                                columns.map((c, i) => {
                                    return <th key={i} 
                                            onClick={() => changeSortField(c)}
                                            className={`${(!sField && typeof c === "string" ) ? 'sort' : ''}  
                                                        ${sField && sField === c ? 'sort' : ''}
                                                            sort--${sOrder}
                                                        `}>
                                            { title[i] ? title[i] : c }
                                    </th>
                                })
                            }
                        </tr>
                    </thead>
                        { renderRows() }
                </table>
            </div>

            { renderFooter() }
        </div>
    )
}
