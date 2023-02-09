export const mapValuesToIndexs = (values, bases) => {
    return values.map((value) => {
        return bases.findIndex((base) => {
            if (base.value) {
                return base.value === value;
            }
            return base.default === value;
        });
    });
};

export const mapIndexsToValues = (indexs, bases) => {
    const result = [];

    bases.forEach((base, index) => {
        if (indexs.includes(index)) {
            if (typeof base === "object")
            {result.push(base.value ? base.value : base.default);}
            if (typeof base === "string") {result.push(base);}
        }
    });

    return result;
};

export const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};
