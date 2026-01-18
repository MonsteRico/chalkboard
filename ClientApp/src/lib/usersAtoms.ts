import type { User } from "../../../shared/types";
import { atom, getDefaultStore } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const localUserAtom = atomWithStorage<User>("localUser", 
    { id: "", displayName: "Anonymous", currentRoomId: "lobby", currentTool: "cursor", cursorColor: "#3b82f6", cursorPosition: { x: 0, y: 0 } }, undefined, {
    getOnInit: true,
});


// Array of users in the current room
export const usersAtom = atom<User[]>([]);

// Create a store instance for non-hook usage
const store = getDefaultStore();

/**
 * Get a user by ID. This function can be called outside of React components.
 * Uses Jotai store directly instead of hooks to avoid "Rules of Hooks" violations.
 */
export const getUserById = (id: string): User | undefined => {
    const users = store.get(usersAtom);
    return users.find((user) => user.id === id);
}

/**
 * Add a user to the users list. This function can be called outside of React components.
 * Uses Jotai store directly instead of hooks to avoid "Rules of Hooks" violations.
 */
export const addUser = (user: User) => {
    store.set(usersAtom, (prevUsers) => {
        // Check if user already exists to prevent duplicates
        if (prevUsers.some(u => u.id === user.id)) {
            return prevUsers;
        }
        return [...prevUsers, user];
    });
}

/**
 * Remove a user from the users list. This function can be called outside of React components.
 * Uses Jotai store directly instead of hooks to avoid "Rules of Hooks" violations.
 */
export const removeUser = (id: string) => {
    store.set(usersAtom, (prevUsers) => prevUsers.filter((user) => user.id !== id));
}

/**
 * Update a user's display name. This function can be called outside of React components.
 * Uses Jotai store directly instead of hooks to avoid "Rules of Hooks" violations.
 */
export const updateDisplayName = (id: string, displayName: string) => {
    store.set(usersAtom, (prevUsers) => 
        prevUsers.map((user) => user.id === id ? { ...user, displayName } : user)
    );
}

/**
 * Update a user's cursor color. This function can be called outside of React components.
 * Uses Jotai store directly instead of hooks to avoid "Rules of Hooks" violations.
 */
export const updateCursorColor = (id: string, cursorColor: string) => {
    store.set(usersAtom, (prevUsers) => 
        prevUsers.map((user) => user.id === id ? { ...user, cursorColor } : user)
    );
}

/**
 * Update a user's cursor position. This function can be called outside of React components.
 * Uses Jotai store directly instead of hooks to avoid "Rules of Hooks" violations.
 */
export const updateCursorPosition = (id: string, cursorPosition: { x: number; y: number }) => {
    store.set(usersAtom, (prevUsers) => 
        prevUsers.map((user) => user.id === id ? { ...user, cursorPosition } : user)
    );
}