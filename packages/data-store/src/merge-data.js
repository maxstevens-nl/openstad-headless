import merge from "merge";

export default function mergeData(currentData, newData, action) {
	let result;

	switch (action) {
		case "create":
			if (Array.isArray(currentData)) {
				if (newData.parentId) {
					// currently for comments
					const parentIndex = currentData.findIndex(
						(elem) => elem.id === newData.parentId,
					);
					if (parentIndex !== -1) {
						result = [...currentData];
						result[parentIndex].replies = result[parentIndex].replies || [];
						result[parentIndex].replies.push(newData);
					}
				} else {
					result = [...currentData];
					result.push(newData);
				}
			} else {
				result = merge.recursive({}, currentData, newData);
			}
			break;

		case "update":
			if (Array.isArray(currentData)) {
				if (newData.parentId) {
					// currently for comments
					const parentIndex = currentData.findIndex(
						(elem) => elem.id === newData.parentId,
					);
					if (parentIndex !== -1) {
						const index = currentData[parentIndex].replies.findIndex(
							(elem) => elem.id === newData.id,
						);
						if (index !== -1) {
							result = [...currentData];
							result[parentIndex].replies[index] = merge.recursive(
								{},
								result[parentIndex].replies[index],
								newData,
							);
						}
					}
				} else {
					const index = currentData.findIndex((elem) => elem.id === newData.id);
					if (index !== -1) {
						result = [...currentData];
						result[index] = merge.recursive({}, result[index], newData);
					}
				}
			} else {
				result = merge.recursive({}, currentData, newData);
			}
			break;

		case "delete":
			if (Array.isArray(currentData)) {
				if (newData.parentId) {
					// currently for comments
					const parentIndex = currentData.findIndex(
						(elem) => elem.id === newData.parentId,
					);
					if (parentIndex !== -1) {
						const index = currentData[parentIndex].replies.findIndex(
							(elem) => elem.id === newData.id,
						);
						if (index !== -1) {
							result = [...currentData];
							result[parentIndex].replies.splice(index, 1);
						}
					}
				} else {
					const index = currentData.findIndex((elem) => elem.id === newData.id);
					if (index !== -1) {
						result = [...currentData];
						result.splice(index, 1);
					}
				}
			} else {
				result = undefined;
			}
			break;

		case "submitLike":
			if (Array.isArray(currentData)) {
				const index = currentData.findIndex((elem) => elem.id === newData.id);
				if (index !== -1) {
					result = [...currentData];
					result.splice(index, 1);
				}
			} else {
				const delta = { [newData.opinion]: currentData[newData.opinion] + 1 };
				const userVote = currentData.userVote;
				if (userVote) {
					delta[userVote.opinion] = currentData[userVote.opinion] - 1;
				}
				result = merge.recursive({}, currentData, delta);
			}
			break;

		default:
			return currentData;
	}

	return result || currentData;
}
