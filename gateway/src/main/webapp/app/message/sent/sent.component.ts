import {Component, OnInit, ViewChild} from '@angular/core';
import {ConfirmService, ITEMS_PER_PAGE, PAGE_SIZE_OPTIONS, SnackBarService} from '../../shared';
import {Principal, User} from '../../account';
import {Message} from '../model/message.model';
import {MessageService} from '../service/message.service';
import {MessageEditComponent} from '../';
import {MatDialog, MatPaginator, PageEvent} from '@angular/material';

@Component({
    templateUrl: './sent.component.html',
    styleUrls: [
        '../message-datapage.css'
    ]
})
export class SentComponent implements OnInit {

    filter = '';

    currentUser: User;
    messages: Message[] = [];
    unreadCount = 0;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    pageSizeOptions = PAGE_SIZE_OPTIONS;
    itemsPerPage = ITEMS_PER_PAGE;
    previousItemsPerPage = ITEMS_PER_PAGE;
    totalItems: number;
    page = 1;
    previousPage = 1;
    predicate = 'id';
    reverse = false;

    constructor(
        private dialog: MatDialog,
        private messageService: MessageService,
        private principal: Principal,
        private confirmService: ConfirmService,
        private snackBarService: SnackBarService,
    ) {
    }

    ngOnInit() {
        this.currentUser = this.principal.getCurrentAccount();
        this.loadAll();
    }

    loadAll() {
        const queryOptions = {
            sender: this.currentUser.login,
        };
        if (this.filter) {
            queryOptions['filter'] = this.filter;
        }
        queryOptions['page'] = this.page - 1;
        queryOptions['size'] = this.itemsPerPage;
        queryOptions['sort'] = this.sort();

        this.messageService.query(queryOptions).subscribe(
            (res) => this.onSuccess(res.body, res.headers),
            (res) => this.onError(res)
        );
    }

    trackIdentity(index, item: Message) {
        return item.id;
    }

    sort() {
        const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
        if (this.predicate !== 'id') {
            result.push('id');
        }
        return result;
    }

    reloadPage(pageEvent: PageEvent) {
        this.itemsPerPage = pageEvent.pageSize;
        this.page = pageEvent.pageIndex + 1;

        if (this.previousPage !== this.page) {
            this.previousPage = this.page;
            this.transition();
        }

        if (this.itemsPerPage !== this.previousItemsPerPage) {
            this.previousItemsPerPage = this.itemsPerPage;
            this.transition();
        }
    }

    transition() {
        this.refresh();
    }

    refresh() {
        this.loadAll();
    }

    private onSuccess(data, headers) {
        this.totalItems = headers.get('X-Total-Count');
        this.messages = data;
    }

    private onError(error) {
        this.snackBarService.error('获取消息出错！');
    }

    viewMessage(message) {
        const dialogRef = this.dialog.open(MessageEditComponent, {
            width: '800px',
            data: {
                operation: 'view',
                viewSent: true,
                message,
            },
        });
    }

    abbreviateText(text: string, num: number): string {
        if (text.length < num + 1) {
            return text;
        } else {
            return text.substring(0, num) + '...';
        }
    }

}
